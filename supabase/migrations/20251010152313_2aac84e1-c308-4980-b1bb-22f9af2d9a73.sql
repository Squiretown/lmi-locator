-- Drop existing views if they exist (for idempotency)
DROP VIEW IF EXISTS invitations_unified CASCADE;
DROP VIEW IF EXISTS crm_contacts_view CASCADE;

-- 1. Create unified invitations view combining user_invitations and client_invitations
CREATE OR REPLACE VIEW invitations_unified AS
SELECT 
  ui.id,
  ui.email,
  ui.first_name,
  ui.last_name,
  ui.phone,
  ui.user_type,
  ui.status,
  ui.invite_code,
  ui.send_via,
  ui.invited_by_user_id as invited_by,
  ui.created_at,
  ui.expires_at,
  ui.accepted_at,
  ui.metadata,
  'user_invitation' as invitation_source
FROM user_invitations ui

UNION ALL

SELECT
  ci.id,
  ci.client_email as email,
  split_part(ci.client_name, ' ', 1) as first_name,
  CASE 
    WHEN array_length(string_to_array(ci.client_name, ' '), 1) > 1 
    THEN substring(ci.client_name from position(' ' in ci.client_name) + 1)
    ELSE NULL 
  END as last_name,
  ci.client_phone as phone,
  'client' as user_type,
  ci.status,
  ci.invitation_code as invite_code,
  ci.invitation_type as send_via,
  ci.professional_id as invited_by,
  ci.created_at,
  ci.expires_at,
  ci.accepted_at,
  ci.team_showcase as metadata,
  'client_invitation' as invitation_source
FROM client_invitations ci;

-- 2. Create CRM contacts unified view
CREATE OR REPLACE VIEW crm_contacts_view AS
-- Professional contacts (realtors from professional_teams for mortgage pros)
SELECT 
  p.id,
  p.user_id,
  'professional' as contact_type,
  p.name as full_name,
  p.name as first_name,
  NULL as last_name,
  pt.mortgage_professional_id as related_to_professional_id,
  p.phone,
  p.email,
  p.company,
  p.professional_type,
  p.status,
  p.created_at,
  p.last_updated as updated_at,
  p.notes,
  p.visibility_settings,
  'team_member' as relationship_type,
  pt.id as relationship_id
FROM professionals p
INNER JOIN professional_teams pt ON p.id = pt.realtor_id
WHERE p.status = 'active' AND pt.status = 'active'

UNION ALL

-- Professional contacts (mortgage pros from professional_teams for realtors)
SELECT 
  p.id,
  p.user_id,
  'professional' as contact_type,
  p.name as full_name,
  p.name as first_name,
  NULL as last_name,
  pt.realtor_id as related_to_professional_id,
  p.phone,
  p.email,
  p.company,
  p.professional_type,
  p.status,
  p.created_at,
  p.last_updated as updated_at,
  p.notes,
  p.visibility_settings,
  'team_member' as relationship_type,
  pt.id as relationship_id
FROM professionals p
INNER JOIN professional_teams pt ON p.id = pt.mortgage_professional_id
WHERE p.status = 'active' AND pt.status = 'active'

UNION ALL

-- Client contacts
SELECT 
  cp.id,
  NULL as user_id,
  'client' as contact_type,
  (cp.first_name || ' ' || COALESCE(cp.last_name, '')) as full_name,
  cp.first_name,
  cp.last_name,
  cp.professional_id as related_to_professional_id,
  cp.phone,
  cp.email,
  NULL as company,
  'client' as professional_type,
  cp.status,
  cp.created_at,
  cp.updated_at,
  cp.notes,
  NULL as visibility_settings,
  'client' as relationship_type,
  NULL as relationship_id
FROM client_profiles cp
WHERE cp.status = 'active';

-- 3. Grant permissions to authenticated users
GRANT SELECT ON invitations_unified TO authenticated;
GRANT SELECT ON crm_contacts_view TO authenticated;

-- 4. Add helpful indexes for better performance
CREATE INDEX IF NOT EXISTS idx_professionals_status_type 
ON professionals(status, professional_type) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_professionals_user_id 
ON professionals(user_id) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_client_profiles_professional_status 
ON client_profiles(professional_id, status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_professional_teams_relationships 
ON professional_teams(mortgage_professional_id, realtor_id, status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_professional_teams_realtor 
ON professional_teams(realtor_id, status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_professional_teams_mortgage 
ON professional_teams(mortgage_professional_id, status) 
WHERE status = 'active';

-- Add comments for documentation
COMMENT ON VIEW invitations_unified IS 'Unified view combining user_invitations and client_invitations for comprehensive invitation tracking';
COMMENT ON VIEW crm_contacts_view IS 'Unified CRM view showing all contacts (team members and clients) with their relationships to the current professional';