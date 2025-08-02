-- PHASE 3 & 4: Final security configuration (Skip existing items)

-- Fix remaining functions with missing search_path (these are the final ones)
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

-- Create comprehensive security monitoring function (if it doesn't exist)
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
  -- Check for tables without RLS (excluding PostGIS system tables)
  SELECT COUNT(*) INTO rls_disabled_count
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE 'spatial_%'
    AND t.table_name NOT LIKE 'geography_%'
    AND t.table_name NOT LIKE 'geometry_%'
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
  
  -- Check recent security events (if table exists)
  BEGIN
    SELECT COUNT(*) INTO recent_security_events
    FROM security_audit_log
    WHERE created_at > now() - interval '24 hours'
      AND severity IN ('high', 'critical');
  EXCEPTION
    WHEN undefined_table THEN
      recent_security_events := 0;
  END;
  
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

-- Grant necessary permissions for security functions
GRANT EXECUTE ON FUNCTION public.comprehensive_security_check() TO authenticated;