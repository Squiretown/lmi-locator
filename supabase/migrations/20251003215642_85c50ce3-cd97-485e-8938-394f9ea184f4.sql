-- Fix check_security_alerts function to remove metadata reference
CREATE OR REPLACE FUNCTION public.check_security_alerts(
  p_since timestamp with time zone DEFAULT (now() - '24:00:00'::interval),
  p_severity text[] DEFAULT ARRAY['critical'::text, 'high'::text],
  p_unacknowledged_only boolean DEFAULT true
)
RETURNS TABLE(
  alert_id uuid,
  alert_type text,
  severity text,
  message text,
  details jsonb,
  affected_users uuid[],
  event_count bigint,
  first_seen timestamp with time zone,
  last_seen timestamp with time zone,
  ip_addresses text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH aggregated_events AS (
    SELECT 
      event_type,
      sal.severity,
      COUNT(*) as count,
      ARRAY_AGG(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as users,
      MIN(created_at) as first_seen,
      MAX(created_at) as last_seen,
      ARRAY_AGG(DISTINCT ip_address) FILTER (WHERE ip_address IS NOT NULL) as ips,
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'user_id', user_id,
          'ip_address', ip_address,
          'description', description,
          'created_at', created_at
        ) ORDER BY created_at DESC
      ) as all_details
    FROM security_audit_log sal
    WHERE created_at >= p_since
      AND sal.severity = ANY(p_severity)
      AND (NOT p_unacknowledged_only OR NOT COALESCE(acknowledged, FALSE))
    GROUP BY event_type, sal.severity
  )
  SELECT 
    gen_random_uuid() as alert_id,
    event_type as alert_type,
    severity,
    CASE 
      WHEN count >= 5 THEN format('🚨 CRITICAL: %s events detected (%s)', count, event_type)
      WHEN count >= 3 THEN format('⚠️ HIGH: %s events detected (%s)', count, event_type)
      ELSE format('ℹ️ %s events detected (%s)', count, event_type)
    END as message,
    jsonb_build_object(
      'event_count', count,
      'events', all_details
    ) as details,
    users as affected_users,
    count as event_count,
    first_seen,
    last_seen,
    ips as ip_addresses
  FROM aggregated_events
  WHERE count >= CASE 
    WHEN severity = 'critical' THEN 1
    WHEN severity = 'high' THEN 2
    WHEN severity = 'medium' THEN 5
    ELSE 10
  END
  ORDER BY severity DESC, last_seen DESC;
END;
$function$;