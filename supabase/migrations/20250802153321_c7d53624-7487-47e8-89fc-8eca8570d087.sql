-- Phase 2: Complete RLS security and remaining function fixes

-- First, let's check which tables don't have RLS enabled and fix them
-- Enable RLS on spatial_ref_sys table (PostGIS system table - should be read-only)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create read-only policy for spatial_ref_sys (everyone can read spatial reference data)
CREATE POLICY "Public read access to spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
USING (true);

-- Update any remaining functions that might not have search_path set
-- Check and update user_is_admin function if it exists
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  );
END;
$function$;

-- Create a secure function to check rate limits (if not exists)
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(ip_addr text, user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  attempt_record RECORD;
  max_attempts INTEGER := 5;
  lockout_duration INTERVAL := '15 minutes';
BEGIN
  -- Get the latest attempt record for this IP/email combination
  SELECT * INTO attempt_record
  FROM auth_rate_limits
  WHERE ip_address = ip_addr AND email = user_email
  ORDER BY last_attempt DESC
  LIMIT 1;
  
  -- If no record exists, this is the first attempt
  IF attempt_record IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if currently blocked
  IF attempt_record.blocked_until IS NOT NULL AND attempt_record.blocked_until > now() THEN
    RETURN false;
  END IF;
  
  -- Check if within rate limit
  IF attempt_record.attempt_count >= max_attempts AND 
     attempt_record.last_attempt > (now() - lockout_duration) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id_param uuid,
  ip_addr text,
  user_agent_param text,
  success_param boolean,
  details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO security_logs (
    event_type,
    user_id,
    ip_address,
    user_agent,
    success,
    details,
    created_at
  ) VALUES (
    event_type,
    user_id_param,
    ip_addr,
    user_agent_param,
    success_param,
    details_param,
    now()
  );
END;
$function$;

-- Update any trigger functions to use proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;