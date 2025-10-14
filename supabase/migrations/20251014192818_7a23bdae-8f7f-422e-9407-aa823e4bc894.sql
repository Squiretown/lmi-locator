-- Fix duplicate entries in crm_contacts_view
-- The issue: JOIN logic allows the same professional_teams record to match twice
-- Solution: Ensure p_owner is always the current user, so each relationship appears once

DROP VIEW IF EXISTS public.crm_contacts_view CASCADE;

CREATE OR REPLACE VIEW public.crm_contacts_view AS
-- Team members from professional_teams (fixed to show each relationship only once)
SELECT
  p_member.id,
  p_member.user_id,
  p_owner.id as related_to_professional_id,
  'professional'::text as contact_type,
  'team_member'::text as relationship_type,
  p_member.name as full_name,
  split_part(p_member.name, ' ', 1) as first_name,
  split_part(p_member.name, ' ', 2) as last_name,
  p_member.email,
  p_member.phone,
  p_member.company,
  p_member.professional_type,
  pt.status,
  pt.notes,
  pt.id as relationship_id,
  NULL::jsonb as visibility_settings,
  pt.created_at,
  pt.created_at as updated_at
FROM professional_teams pt
JOIN professionals p_owner ON (
  pt.mortgage_professional_id = p_owner.id OR pt.realtor_id = p_owner.id
)
JOIN professionals p_member ON (
  (pt.mortgage_professional_id = p_member.id AND pt.realtor_id != p_member.id) OR
  (pt.realtor_id = p_member.id AND pt.mortgage_professional_id != p_member.id)
)
WHERE p_owner.user_id = auth.uid()  -- Only match when current user is the "owner" side
AND p_member.user_id != auth.uid()  -- Ensure we're showing the OTHER person
AND pt.status = 'active'

UNION ALL

-- Client profiles
SELECT
  cp.id,
  NULL::uuid as user_id,
  cp.professional_id as related_to_professional_id,
  'client'::text as contact_type,
  'client'::text as relationship_type,
  cp.first_name || ' ' || cp.last_name as full_name,
  cp.first_name,
  cp.last_name,
  cp.email,
  cp.phone,
  NULL::text as company,
  NULL::text as professional_type,
  cp.status,
  cp.notes,
  NULL::uuid as relationship_id,
  NULL::jsonb as visibility_settings,
  cp.created_at,
  cp.updated_at
FROM client_profiles cp
WHERE cp.professional_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
)
AND cp.status = 'active'

UNION ALL

-- Manual contacts from contacts table
SELECT
  c.id,
  NULL::uuid as user_id,
  c.owner_id as related_to_professional_id,
  'professional'::text as contact_type,
  'team_member'::text as relationship_type,
  c.first_name || ' ' || c.last_name as full_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.company_name as company,
  c.professional_type,
  c.status,
  c.notes,
  NULL::uuid as relationship_id,
  jsonb_build_object('visible_to_clients', c.visible_to_clients) as visibility_settings,
  c.created_at,
  c.last_updated as updated_at
FROM contacts c
WHERE c.owner_id IN (
  SELECT id FROM professionals WHERE user_id = auth.uid()
)
AND c.requires_system_access = false
AND c.status = 'active';

GRANT SELECT ON public.crm_contacts_view TO authenticated;