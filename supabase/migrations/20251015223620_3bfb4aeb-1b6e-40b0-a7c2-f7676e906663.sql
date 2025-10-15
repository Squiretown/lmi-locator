
-- Step 1: Backfill Michel's client profile and team assignments
-- Create Michel's client_profile
INSERT INTO client_profiles (
  id,
  user_id,
  professional_id,
  first_name,
  last_name,
  email,
  status,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '34d3a8dc-e95f-4304-9023-f22b5f5aebae', -- Michel's auth user_id
  '2fd96b3e-ca89-4aff-9f93-f7c8b2b9d240', -- Shawn's professional_id (realtor who invited)
  'Michel',
  'Stein',
  'info@shawnmichaelrealty.com',
  'active',
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- Create team assignment for Shawn (realtor)
INSERT INTO client_team_assignments (
  id,
  client_id,
  professional_id,
  professional_role,
  status,
  assigned_by,
  assigned_at
)
SELECT 
  gen_random_uuid(),
  cp.id,
  '2fd96b3e-ca89-4aff-9f93-f7c8b2b9d240', -- Shawn's professional_id
  'realtor',
  'active',
  '2fd96b3e-ca89-4aff-9f93-f7c8b2b9d240', -- assigned by Shawn
  now()
FROM client_profiles cp
WHERE cp.user_id = '34d3a8dc-e95f-4304-9023-f22b5f5aebae'
ON CONFLICT DO NOTHING;

-- Create team assignment for Christine (mortgage professional)
INSERT INTO client_team_assignments (
  id,
  client_id,
  professional_id,
  professional_role,
  status,
  assigned_by,
  assigned_at
)
SELECT 
  gen_random_uuid(),
  cp.id,
  'f7687839-541d-4e9d-a87f-767cb62bf7b7', -- Christine's professional_id
  'mortgage_professional',
  'active',
  '2fd96b3e-ca89-4aff-9f93-f7c8b2b9d240', -- assigned by Shawn
  now()
FROM client_profiles cp
WHERE cp.user_id = '34d3a8dc-e95f-4304-9023-f22b5f5aebae'
ON CONFLICT DO NOTHING;

-- Step 2: Create helper function to get current professional_id from auth.uid()
CREATE OR REPLACE FUNCTION public.get_current_professional_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM professionals WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 3: Fix RLS policies for client_team_assignments
-- Drop old policies
DROP POLICY IF EXISTS "Professionals can manage their client assignments" ON client_team_assignments;
DROP POLICY IF EXISTS "Professionals can view their client assignments" ON client_team_assignments;

-- Create new policies using get_current_professional_id()
CREATE POLICY "Professionals can manage their client assignments"
ON client_team_assignments
FOR ALL
USING (
  assigned_by = auth.uid() OR 
  professional_id = get_current_professional_id()
)
WITH CHECK (
  assigned_by = auth.uid() OR 
  professional_id = get_current_professional_id()
);

CREATE POLICY "Professionals can view their assignments"
ON client_team_assignments
FOR SELECT
USING (professional_id = get_current_professional_id());

-- Step 4: Create function to backfill existing client profiles
CREATE OR REPLACE FUNCTION public.backfill_client_user_ids()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update client_profiles where user_id is NULL but email matches an auth user
  UPDATE client_profiles cp
  SET user_id = au.id
  FROM auth.users au
  WHERE cp.user_id IS NULL 
    AND cp.email IS NOT NULL
    AND cp.email = au.email;
END;
$$;

-- Run the backfill
SELECT backfill_client_user_ids();
