-- PHASE 3: Complete remaining security configurations

-- Fix remaining functions with missing search_path
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(email_param text, ip_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  blocked_until_time timestamptz;
  attempt_count_val integer;
BEGIN
  -- Check if IP/email combination is currently blocked
  SELECT blocked_until, attempt_count 
  INTO blocked_until_time, attempt_count_val
  FROM auth_rate_limits 
  WHERE (email = email_param OR ip_address = ip_param)
  AND blocked_until > now();
  
  -- If blocked and still within block period, deny
  IF blocked_until_time IS NOT NULL AND blocked_until_time > now() THEN
    RETURN false;
  END IF;
  
  -- Allow if not blocked
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id_param uuid,
  ip_address_param text,
  user_agent_param text,
  details_param jsonb,
  severity_param text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO security_audit_log (
    event_type,
    user_id,
    ip_address,
    user_agent,
    event_details,
    severity,
    created_at
  ) VALUES (
    event_type,
    user_id_param,
    ip_address_param,
    user_agent_param,
    details_param,
    severity_param,
    now()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

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

-- Enable RLS on spatial_ref_sys table (PostGIS system table)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create read-only policy for spatial_ref_sys (standard PostGIS reference data)
CREATE POLICY "Allow read access to spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
USING (true);

-- PHASE 4: Final security validation and comprehensive audit table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  ip_address text,
  user_agent text,
  event_details jsonb,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (user_is_admin());

-- Allow system to insert security events
CREATE POLICY "Allow security event logging" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create comprehensive security monitoring function
CREATE OR REPLACE FUNCTION public.comprehensive_security_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result jsonb := '{}';
  rls_disabled_count integer;
  insecure_functions_count integer;
  recent_security_events integer;
BEGIN
  -- Check for tables without RLS
  SELECT COUNT(*) INTO rls_disabled_count
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND NOT c.relrowsecurity;
  
  -- Check for functions without proper search_path
  SELECT COUNT(*) INTO insecure_functions_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND (p.proconfig IS NULL OR NOT EXISTS (
      SELECT 1 FROM unnest(p.proconfig) AS config
      WHERE config LIKE 'search_path=%'
    ));
  
  -- Check recent security events
  SELECT COUNT(*) INTO recent_security_events
  FROM security_audit_log
  WHERE created_at > now() - interval '24 hours'
    AND severity IN ('high', 'critical');
  
  -- Build result
  result := jsonb_build_object(
    'timestamp', now(),
    'rls_disabled_tables', rls_disabled_count,
    'insecure_functions', insecure_functions_count,
    'recent_critical_events', recent_security_events,
    'overall_status', CASE 
      WHEN rls_disabled_count = 0 AND insecure_functions_count = 0 THEN 'secure'
      WHEN rls_disabled_count > 0 OR insecure_functions_count > 0 THEN 'attention_needed'
      ELSE 'unknown'
    END
  );
  
  RETURN result;
END;
$function$;

-- Create index for performance on security audit log
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON public.security_audit_log(severity);

-- Grant necessary permissions for security functions
GRANT EXECUTE ON FUNCTION public.comprehensive_security_check() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, uuid, text, text, jsonb, text) TO service_role;