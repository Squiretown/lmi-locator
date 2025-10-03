-- Add new columns to security_audit_log table
ALTER TABLE public.security_audit_log
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS acknowledged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS acknowledged_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity_created 
ON public.security_audit_log(severity, created_at, acknowledged);

-- Function to check security alerts
CREATE OR REPLACE FUNCTION public.check_security_alerts(
  p_since TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  p_severity TEXT[] DEFAULT ARRAY['critical', 'high'],
  p_unacknowledged_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  alert_id UUID,
  alert_type TEXT,
  severity TEXT,
  message TEXT,
  details JSONB,
  affected_users UUID[],
  event_count BIGINT,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  ip_addresses TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
          'metadata', metadata,
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
$$;

-- Function to acknowledge security alerts
CREATE OR REPLACE FUNCTION public.acknowledge_security_alert(
  p_event_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT user_is_admin() THEN
    RAISE EXCEPTION 'Only admins can acknowledge security alerts';
  END IF;

  -- Update the events
  UPDATE security_audit_log
  SET 
    acknowledged = TRUE,
    acknowledged_by = auth.uid(),
    acknowledged_at = NOW()
  WHERE id = ANY(p_event_ids)
    AND acknowledged = FALSE;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', TRUE,
    'acknowledged_count', v_updated_count,
    'acknowledged_by', auth.uid(),
    'acknowledged_at', NOW()
  );
END;
$$;

-- Function to generate test security alert
CREATE OR REPLACE FUNCTION public.create_test_security_alert()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT user_is_admin() THEN
    RAISE EXCEPTION 'Only admins can create test alerts';
  END IF;

  -- Insert test alert
  INSERT INTO security_audit_log (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    'test_alert',
    'critical',
    'This is a test security alert',
    jsonb_build_object(
      'test', TRUE,
      'created_by', auth.uid(),
      'timestamp', NOW()
    ),
    auth.uid(),
    '127.0.0.1'
  )
  RETURNING id INTO v_alert_id;

  RETURN v_alert_id;
END;
$$;

-- Enable RLS on security_audit_log if not already enabled
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all security logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Admins can update security logs" ON public.security_audit_log;

-- Create policies for admins to view all security logs
CREATE POLICY "Admins can view all security logs"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (user_is_admin());

-- Policy for admins to update security logs (for acknowledgment)
CREATE POLICY "Admins can update security logs"
ON public.security_audit_log
FOR UPDATE
TO authenticated
USING (user_is_admin())
WITH CHECK (user_is_admin());

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_security_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION public.acknowledge_security_alert TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_security_alert TO authenticated;