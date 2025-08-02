-- Phase 1: Critical Security Fixes - Database Function Security
-- Fix search_path vulnerabilities in all database functions

-- Update admin_update_user_role function
CREATE OR REPLACE FUNCTION public.admin_update_user_role(p_target_user_id uuid, p_new_role text, p_reason text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Update other critical functions with secure search_path
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_target_user_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT NULL::jsonb, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_success boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Update anonymize_user_search_history function
CREATE OR REPLACE FUNCTION public.anonymize_user_search_history(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Anonymize search history by removing personal identifiers but preserving analytics data
  UPDATE public.search_history 
  SET 
    user_id = NULL,
    ip_address = NULL,
    user_agent = NULL
  WHERE user_id = target_user_id;
  
  -- Log the anonymization for audit purposes
  INSERT INTO public.activity_logs (
    activity_type,
    description,
    user_id,
    entity_type,
    entity_id,
    data
  ) VALUES (
    'user_data_anonymized',
    'Search history anonymized before user deletion',
    target_user_id,
    'search_history',
    target_user_id::text,
    jsonb_build_object('anonymized_records', (SELECT COUNT(*) FROM public.search_history WHERE user_id IS NULL))
  );
END;
$function$;

-- Update get_all_permissions function
CREATE OR REPLACE FUNCTION public.get_all_permissions()
RETURNS TABLE(permission_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.permission_name
  FROM public.permissions p;
END;
$function$;

-- Update get_user_permissions function
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(permission_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.permission_name
  FROM public.user_profiles up
  JOIN public.user_type_permissions utp ON up.user_type_id = utp.user_type_id
  JOIN public.permissions p ON utp.permission_id = p.permission_id
  WHERE up.user_id = user_uuid;
END;
$function$;

-- Update get_user_type_name function
CREATE OR REPLACE FUNCTION public.get_user_type_name(profile_id uuid)
RETURNS TABLE(type_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT ut.type_name
  FROM public.user_profiles up
  JOIN public.user_types ut ON up.user_type_id = ut.type_id
  WHERE up.id = profile_id;
END;
$function$;

-- Create secure user_is_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if current user has admin role in metadata
  RETURN COALESCE(
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'),
    false
  );
END;
$function$;

-- Add rate limiting for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  email text,
  attempt_count integer DEFAULT 1,
  first_attempt timestamp with time zone DEFAULT now(),
  last_attempt timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on auth_rate_limits
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage rate limits
CREATE POLICY "Service role can manage auth rate limits"
ON public.auth_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(p_ip_address text, p_email text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_max_attempts integer := 5;
  v_lockout_duration interval := '15 minutes';
  v_record public.auth_rate_limits%ROWTYPE;
BEGIN
  -- Get existing record
  SELECT * INTO v_record 
  FROM public.auth_rate_limits 
  WHERE ip_address = p_ip_address 
  AND (p_email IS NULL OR email = p_email)
  ORDER BY last_attempt DESC 
  LIMIT 1;

  -- Check if currently blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > now() THEN
    RETURN false;
  END IF;

  -- Reset if more than 15 minutes since last attempt
  IF v_record.last_attempt IS NULL OR v_record.last_attempt < (now() - v_lockout_duration) THEN
    -- Reset or create new record
    INSERT INTO public.auth_rate_limits (ip_address, email, attempt_count, first_attempt, last_attempt)
    VALUES (p_ip_address, p_email, 1, now(), now())
    ON CONFLICT (ip_address) DO UPDATE SET
      attempt_count = 1,
      first_attempt = now(),
      last_attempt = now(),
      blocked_until = NULL;
    RETURN true;
  END IF;

  -- Increment attempt count
  UPDATE public.auth_rate_limits 
  SET 
    attempt_count = attempt_count + 1,
    last_attempt = now(),
    blocked_until = CASE 
      WHEN attempt_count >= v_max_attempts THEN now() + v_lockout_duration
      ELSE NULL
    END
  WHERE ip_address = p_ip_address;

  -- Return false if max attempts reached
  RETURN (v_record.attempt_count + 1) <= v_max_attempts;
END;
$function$;