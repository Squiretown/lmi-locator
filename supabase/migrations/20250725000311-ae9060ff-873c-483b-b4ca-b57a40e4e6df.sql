-- CRITICAL SECURITY FIXES

-- 1. Enable RLS on tables that currently lack it
ALTER TABLE public.census_tracts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for census_tracts (public read access is appropriate for census data)
CREATE POLICY "Public read access to census tracts" 
ON public.census_tracts 
FOR SELECT 
USING (true);

-- Admin-only write access for census_tracts
CREATE POLICY "Admin write access to census tracts" 
ON public.census_tracts 
FOR ALL 
USING (user_is_admin())
WITH CHECK (user_is_admin());

-- 2. Fix all database functions to have proper search_path
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'user_type' = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type',
    'client'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.check_admin_status()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin',
    false
  );
$$;

-- 3. Create secure role management system
CREATE TABLE IF NOT EXISTS public.user_role_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_role text,
  new_role text NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamp with time zone DEFAULT now(),
  reason text,
  ip_address text,
  user_agent text
);

ALTER TABLE public.user_role_changes ENABLE ROW LEVEL SECURITY;

-- Only admins can view role change logs
CREATE POLICY "Admins can view role changes" 
ON public.user_role_changes 
FOR SELECT 
USING (user_is_admin());

-- Only admins can insert role changes
CREATE POLICY "Admins can insert role changes" 
ON public.user_role_changes 
FOR INSERT 
WITH CHECK (user_is_admin());

-- 4. Create audit log for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  target_user_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  success boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (user_is_admin());

-- Allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 5. Secure function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_target_user_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_id,
    target_user_id,
    details,
    ip_address,
    user_agent,
    success
  ) VALUES (
    p_event_type,
    COALESCE(p_user_id, auth.uid()),
    p_target_user_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_success
  );
END;
$$;

-- 6. Create function to safely update user roles (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  p_target_user_id uuid,
  p_new_role text,
  p_reason text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_old_role text;
  v_result json;
BEGIN
  -- Check if current user is admin
  IF NOT user_is_admin() THEN
    PERFORM log_security_event(
      'unauthorized_role_change_attempt',
      auth.uid(),
      p_target_user_id,
      jsonb_build_object('attempted_role', p_new_role, 'reason', p_reason),
      NULL,
      NULL,
      false
    );
    RAISE EXCEPTION 'Insufficient permissions. Admin access required.';
  END IF;

  -- Prevent self-demotion
  IF auth.uid() = p_target_user_id AND p_new_role != 'admin' THEN
    PERFORM log_security_event(
      'admin_self_demotion_attempt',
      auth.uid(),
      p_target_user_id,
      jsonb_build_object('attempted_role', p_new_role),
      NULL,
      NULL,
      false
    );
    RAISE EXCEPTION 'Admins cannot change their own role.';
  END IF;

  -- Get current role
  SELECT raw_user_meta_data->>'user_type' INTO v_old_role
  FROM auth.users 
  WHERE id = p_target_user_id;

  -- Log the role change
  INSERT INTO public.user_role_changes (
    user_id,
    old_role,
    new_role,
    changed_by,
    reason
  ) VALUES (
    p_target_user_id,
    v_old_role,
    p_new_role,
    auth.uid(),
    p_reason
  );

  -- Log security event
  PERFORM log_security_event(
    'user_role_changed',
    auth.uid(),
    p_target_user_id,
    jsonb_build_object(
      'old_role', v_old_role,
      'new_role', p_new_role,
      'reason', p_reason
    )
  );

  v_result := json_build_object(
    'success', true,
    'old_role', v_old_role,
    'new_role', p_new_role,
    'changed_by', auth.uid()
  );

  RETURN v_result;
END;
$$;

-- 7. Fix user profiles trigger to prevent role escalation
CREATE OR REPLACE FUNCTION public.secure_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_type text;
BEGIN
  -- Default to 'client' and validate user_type
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'client');
  
  -- Only allow specific user types
  IF v_user_type NOT IN ('client', 'professional', 'admin') THEN
    v_user_type := 'client';
  END IF;

  -- Insert into user_profiles with validated metadata
  INSERT INTO public.user_profiles (
    user_id,
    user_type
  ) VALUES (
    NEW.id,
    v_user_type
  );
  
  -- Create default notification preferences
  PERFORM public.create_default_notification_preferences(NEW.id);
  
  -- Log user creation
  PERFORM log_security_event(
    'user_created',
    NEW.id,
    NULL,
    jsonb_build_object('user_type', v_user_type)
  );
  
  RETURN NEW;
END;
$$;