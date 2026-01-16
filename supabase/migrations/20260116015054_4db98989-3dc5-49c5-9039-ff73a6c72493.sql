-- Fix crm_contacts_view: Manual contacts should use professional_type as relationship_type
DROP VIEW IF EXISTS public.crm_contacts_view CASCADE;

CREATE OR REPLACE VIEW public.crm_contacts_view AS

-- Case 1: Mortgage Pro sees their Realtor partners
SELECT
  realtor.id,
  realtor.user_id,
  mortgage_pro.id as related_to_professional_id,
  'professional'::text as contact_type,
  'realtor_partner'::text as relationship_type,
  realtor.name as full_name,
  split_part(realtor.name, ' ', 1) as first_name,
  NULLIF(substring(realtor.name from position(' ' in realtor.name) + 1), '') as last_name,
  realtor.email,
  realtor.phone,
  realtor.company,
  realtor.professional_type,
  pt.status,
  pt.notes,
  pt.id as relationship_id,
  realtor.visibility_settings,
  pt.created_at,
  pt.created_at as updated_at
FROM professional_teams pt
INNER JOIN professionals mortgage_pro ON pt.mortgage_professional_id = mortgage_pro.id
INNER JOIN professionals realtor ON pt.realtor_id = realtor.id
WHERE mortgage_pro.user_id = auth.uid()
  AND pt.status = 'active'
  AND realtor.status = 'active'

UNION ALL

-- Case 2: Realtor sees their Mortgage Pro partners
SELECT
  mortgage_pro.id,
  mortgage_pro.user_id,
  realtor.id as related_to_professional_id,
  'professional'::text as contact_type,
  'lending_team'::text as relationship_type,
  mortgage_pro.name as full_name,
  split_part(mortgage_pro.name, ' ', 1) as first_name,
  NULLIF(substring(mortgage_pro.name from position(' ' in mortgage_pro.name) + 1), '') as last_name,
  mortgage_pro.email,
  mortgage_pro.phone,
  mortgage_pro.company,
  mortgage_pro.professional_type,
  pt.status,
  pt.notes,
  pt.id as relationship_id,
  mortgage_pro.visibility_settings,
  pt.created_at,
  pt.created_at as updated_at
FROM professional_teams pt
INNER JOIN professionals mortgage_pro ON pt.mortgage_professional_id = mortgage_pro.id
INNER JOIN professionals realtor ON pt.realtor_id = realtor.id
WHERE realtor.user_id = auth.uid()
  AND pt.status = 'active'
  AND mortgage_pro.status = 'active'

UNION ALL

-- Case 3: Clients
SELECT
  cp.id,
  cp.user_id,
  cp.professional_id as related_to_professional_id,
  'client'::text as contact_type,
  'client'::text as relationship_type,
  cp.first_name || ' ' || COALESCE(cp.last_name, '') as full_name,
  cp.first_name,
  cp.last_name,
  cp.email,
  cp.phone,
  NULL::text as company,
  'client'::text as professional_type,
  COALESCE(cp.status, 'active') as status,
  cp.notes,
  NULL::uuid as relationship_id,
  NULL::jsonb as visibility_settings,
  cp.created_at,
  cp.updated_at
FROM client_profiles cp
INNER JOIN professionals p ON cp.professional_id = p.id
WHERE p.user_id = auth.uid()
  AND (cp.status != 'deactivated' OR cp.status IS NULL)

UNION ALL

-- Case 4: Manual contacts (attorneys, title companies, etc.)
-- KEY FIX: Use professional_type as relationship_type!
SELECT
  c.id,
  NULL::uuid as user_id,
  c.owner_id as related_to_professional_id,
  'manual'::text as contact_type,
  c.professional_type as relationship_type,
  c.first_name || ' ' || COALESCE(c.last_name, '') as full_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.company_name as company,
  c.professional_type,
  COALESCE(c.status, 'active') as status,
  c.notes,
  NULL::uuid as relationship_id,
  CASE WHEN c.visible_to_clients THEN 
    jsonb_build_object('visible_to_clients', true)
  ELSE 
    jsonb_build_object('visible_to_clients', false)
  END as visibility_settings,
  c.created_at,
  c.created_at as updated_at
FROM contacts c
INNER JOIN professionals p ON c.owner_id = p.id
WHERE p.user_id = auth.uid()
  AND (c.status = 'active' OR c.status IS NULL);

GRANT SELECT ON crm_contacts_view TO authenticated;