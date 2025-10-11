-- Bug #2 Fix: Create helper function and update RLS policies for professional_teams

-- Step 1: Create helper function to map auth.uid() to professional_id
CREATE OR REPLACE FUNCTION get_current_professional_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM professionals
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Step 2: Drop old/redundant policies
DROP POLICY IF EXISTS "Professionals can create team relationships" ON professional_teams;
DROP POLICY IF EXISTS "Mortgage professionals can manage their teams" ON professional_teams;
DROP POLICY IF EXISTS "Professionals can view their teams" ON professional_teams;
DROP POLICY IF EXISTS "Professionals can view their team relationships" ON professional_teams;
DROP POLICY IF EXISTS "Professionals can update their team relationships" ON professional_teams;

-- Step 3: Create new correct INSERT policy
CREATE POLICY "Professionals can create team relationships"
ON professional_teams FOR INSERT
WITH CHECK (
  mortgage_professional_id = get_current_professional_id() 
  OR realtor_id = get_current_professional_id()
);

-- Step 4: Create new correct SELECT policy
CREATE POLICY "Professionals can view their teams"
ON professional_teams FOR SELECT
USING (
  mortgage_professional_id = get_current_professional_id()
  OR realtor_id = get_current_professional_id()
);

-- Step 5: Create new correct UPDATE policy
CREATE POLICY "Professionals can update their teams"
ON professional_teams FOR UPDATE
USING (
  mortgage_professional_id = get_current_professional_id()
  OR realtor_id = get_current_professional_id()
);

-- Step 6: Add missing DELETE policy
CREATE POLICY "Professionals can delete their team relationships"
ON professional_teams FOR DELETE
USING (
  mortgage_professional_id = get_current_professional_id()
  OR realtor_id = get_current_professional_id()
);