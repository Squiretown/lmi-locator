-- Phase 2: Complete remaining security fixes (corrected)

-- Update user_is_admin function with proper security settings
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

-- Drop and recreate rate limiting function with correct parameters
DROP FUNCTION IF EXISTS public.check_auth_rate_limit(text, text);

CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(p_ip_address text, p_email text)
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
  WHERE ip_address = p_ip_address AND email = p_email
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

-- Create secure logging function
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

-- Update trigger function with proper security
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