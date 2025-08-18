-- Phase 2 Complete Implementation: Create views, fix security, and optimize

-- Update existing functions with proper search paths for security compliance
CREATE OR REPLACE FUNCTION check_user_permission_simple(user_uuid uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin via metadata first
  IF (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin') THEN
    RETURN true;
  END IF;
  
  -- For now, use temporary permission logic
  RETURN false;
END;
$$;

-- Update get_current_professional_id function with proper search path
CREATE OR REPLACE FUNCTION get_current_professional_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT p.id 
    FROM professionals p 
    WHERE p.user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Update user_is_admin function with proper search path
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.user_type = 'admin'
  );
END;
$$;

-- Update generate_invitation_code function with proper search path
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
END;
$$;

-- Create Phase 2 Views for unified invitation system

-- 1. Unified invitations view - normalizes all invitation types
CREATE OR REPLACE VIEW invitations_unified AS
SELECT 
  id,
  professional_id,
  'client' as invitation_type,
  client_email as recipient_email,
  client_name as recipient_name,
  client_phone as recipient_phone,
  status,
  invitation_code,
  created_at,
  sent_at,
  accepted_at,
  expires_at,
  custom_message,
  template_type,
  email_sent,
  sms_sent,
  target_professional_role,
  team_context
FROM client_invitations;

-- 2. Invitation stats view for analytics
CREATE OR REPLACE VIEW invitations_stats_view AS
SELECT 
  professional_id,
  status,
  COUNT(*) as invitation_count,
  COUNT(*) FILTER (WHERE email_sent = true) as email_sent_count,
  COUNT(*) FILTER (WHERE sms_sent = true) as sms_sent_count,
  COUNT(*) FILTER (WHERE accepted_at IS NOT NULL) as accepted_count,
  COUNT(*) FILTER (WHERE expires_at < NOW() AND status = 'pending') as expired_count,
  AVG(EXTRACT(EPOCH FROM (accepted_at - created_at))/86400.0) as avg_days_to_accept,
  DATE_TRUNC('day', created_at) as date_created
FROM client_invitations
GROUP BY professional_id, status, DATE_TRUNC('day', created_at);

-- 3. CRM contacts view - unified professional and client view
CREATE OR REPLACE VIEW crm_contacts_view AS
-- Professional profiles
SELECT 
  p.id,
  p.user_id,
  'professional' as contact_type,
  p.name as full_name,
  p.name as first_name,
  NULL as last_name,
  NULL as professional_id,
  p.phone,
  NULL as email, -- Email would come from auth.users if needed
  p.company,
  p.type as professional_type,
  p.status,
  p.created_at,
  p.last_updated as updated_at,
  NULL as notes
FROM professionals p
WHERE p.status != 'inactive'

UNION ALL

-- Client profiles  
SELECT 
  cp.id,
  NULL as user_id,
  'client' as contact_type,
  (cp.first_name || ' ' || cp.last_name) as full_name,
  cp.first_name,
  cp.last_name,
  cp.professional_id,
  cp.phone,
  cp.email,
  NULL as company,
  NULL as professional_type,
  cp.status,
  cp.created_at,
  cp.updated_at,
  cp.notes
FROM client_profiles cp
WHERE cp.status = 'active';

-- Create performance indexes for Phase 2 optimization
CREATE INDEX IF NOT EXISTS idx_client_invitations_professional_status 
ON client_invitations(professional_id, status);

CREATE INDEX IF NOT EXISTS idx_client_invitations_email_status 
ON client_invitations(client_email, status);

CREATE INDEX IF NOT EXISTS idx_client_invitations_expires_at 
ON client_invitations(expires_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_professionals_user_id_status 
ON professionals(user_id, status);

-- Grant permissions to authenticated users
GRANT SELECT ON invitations_unified TO authenticated;
GRANT SELECT ON invitations_stats_view TO authenticated; 
GRANT SELECT ON crm_contacts_view TO authenticated;