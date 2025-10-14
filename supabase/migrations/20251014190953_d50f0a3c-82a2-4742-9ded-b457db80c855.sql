-- Update crm_contacts_view to filter out inactive contacts
DROP VIEW IF EXISTS public.crm_contacts_view CASCADE;

CREATE OR REPLACE VIEW public.crm_contacts_view AS
-- Existing team members from professional_teams
SELECT
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN p_member.id
    ELSE p_owner.id
  END as id,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN p_member.user_id
    ELSE p_owner.user_id
  END as user_id,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN p_owner.id
    ELSE p_member.id
  END as related_to_professional_id,
  'professional'::text as contact_type,
  'team_member'::text as relationship_type,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN p_member.name
    ELSE p_owner.name
  END as full_name,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN split_part(p_member.name, ' ', 1)
    ELSE split_part(p_owner.name, ' ', 1)
  END as first_name,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN split_part(p_member.name, ' ', 2)
    ELSE split_part(p_owner.name, ' ', 2)
  END as last_name,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN p_member.email
    ELSE p_owner.email
  END as email,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN p_member.phone
    ELSE p_owner.phone
  END as phone,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN p_member.company
    ELSE p_owner.company
  END as company,
  CASE 
    WHEN p_owner.user_id = auth.uid() THEN p_member.professional_type
    ELSE p_owner.professional_type
  END as professional_type,
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
WHERE (p_owner.user_id = auth.uid() OR p_member.user_id = auth.uid())
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