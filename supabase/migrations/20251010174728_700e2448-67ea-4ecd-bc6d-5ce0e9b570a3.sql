-- ============================================
-- TEAM MEMBERS TABLE FOR INTERNAL LENDING TEAMS
-- ============================================
-- This table allows mortgage professionals to explicitly add
-- team members (processors, underwriters, assistants, etc.)
-- Replaces the insecure company-based auto-teaming

-- Create enum for team member roles
CREATE TYPE team_member_role AS ENUM (
  'loan_officer',
  'processor', 
  'underwriter',
  'manager',
  'assistant',
  'coordinator'
);

-- Create team_members table
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The user who owns this team (e.g., lead loan officer)
  team_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- The team member being added (must be a mortgage professional)
  team_member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role of this team member
  role team_member_role,
  
  -- Granular permissions for this team member
  permissions jsonb DEFAULT '{
    "view_clients": true,
    "edit_clients": false,
    "send_communications": false,
    "view_pipeline": true,
    "manage_documents": false
  }'::jsonb,
  
  -- Status of this team relationship
  status text NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive', 'pending')),
  
  -- Metadata
  added_at timestamptz DEFAULT now(),
  added_by uuid REFERENCES auth.users(id),
  notes text,
  
  -- Constraints
  UNIQUE(team_owner_id, team_member_id),
  CHECK (team_owner_id != team_member_id) -- Can't add yourself
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view teams they're part of"
  ON team_members FOR SELECT
  USING (
    auth.uid() = team_owner_id OR 
    auth.uid() = team_member_id
  );

CREATE POLICY "Team owners can manage their teams"
  ON team_members FOR ALL
  USING (auth.uid() = team_owner_id)
  WITH CHECK (auth.uid() = team_owner_id);

-- Indexes for performance
CREATE INDEX idx_team_members_owner 
  ON team_members(team_owner_id) 
  WHERE status = 'active';

CREATE INDEX idx_team_members_member 
  ON team_members(team_member_id) 
  WHERE status = 'active';

-- Comments for documentation
COMMENT ON TABLE team_members IS 
  'Internal lending team relationships - explicit team member additions only. Replaces company-based auto-teaming.';

COMMENT ON COLUMN team_members.team_owner_id IS 
  'The user who owns this team (e.g., lead loan officer)';

COMMENT ON COLUMN team_members.team_member_id IS 
  'The team member being added to the team';

COMMENT ON COLUMN team_members.permissions IS 
  'JSONB object containing granular permissions for team member actions';

-- ============================================
-- UPDATE CRM CONTACTS VIEW
-- ============================================
-- Drop and recreate the view to include team_members
DROP VIEW IF EXISTS crm_contacts_view;

CREATE OR REPLACE VIEW crm_contacts_view AS

-- Client profiles (existing)
SELECT 
  cp.id,
  NULL::uuid as user_id,
  'client' as contact_type,
  (cp.first_name || ' ' || cp.last_name) as full_name,
  cp.first_name,
  cp.last_name,
  cp.email,
  cp.phone,
  NULL as company,
  NULL as professional_type,
  cp.status,
  cp.professional_id as related_to_professional_id,
  cp.id as relationship_id,
  'client' as relationship_type,
  NULL::jsonb as visibility_settings,
  cp.created_at,
  cp.updated_at,
  cp.notes
FROM client_profiles cp
WHERE cp.status != 'inactive'

UNION ALL

-- Realtor partners from professional_teams (existing)
SELECT 
  p.id,
  p.user_id,
  'professional' as contact_type,
  p.name as full_name,
  split_part(p.name, ' ', 1) as first_name,
  split_part(p.name, ' ', 2) as last_name,
  NULL as email,
  p.phone,
  p.company,
  p.professional_type,
  p.status,
  pt.mortgage_professional_id as related_to_professional_id,
  pt.id as relationship_id,
  'partner' as relationship_type,
  p.visibility_settings,
  pt.created_at,
  pt.created_at as updated_at,
  NULL as notes
FROM professionals p
INNER JOIN professional_teams pt ON p.id = pt.realtor_id
WHERE pt.status = 'active' AND p.status = 'active'

UNION ALL

-- Internal team members (NEW - from team_members table)
SELECT 
  p.id,
  p.user_id,
  'professional' as contact_type,
  p.name as full_name,
  split_part(p.name, ' ', 1) as first_name,
  split_part(p.name, ' ', 2) as last_name,
  NULL as email,
  p.phone,
  p.company,
  p.professional_type,
  p.status,
  tm.team_owner_id as related_to_professional_id,
  tm.id as relationship_id,
  'team_member' as relationship_type,
  p.visibility_settings,
  tm.added_at as created_at,
  tm.added_at as updated_at,
  tm.notes
FROM professionals p
INNER JOIN team_members tm ON p.user_id = tm.team_member_id
WHERE tm.status = 'active' AND p.status = 'active';

COMMENT ON VIEW crm_contacts_view IS 
  'Unified view of all contacts (clients, partners, team members) for the CRM dashboard';