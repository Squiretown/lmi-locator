-- Fix recursion in professionals RLS policy by removing self-referential SELECTs
-- 1) Drop prior policies that may be recursive
DROP POLICY IF EXISTS "Clients can view their assigned professionals" ON professionals;
DROP POLICY IF EXISTS "Clients can view assigned professionals" ON professionals;

-- 2) Create a non-recursive policy allowing:
--    - professionals to view their own row
--    - clients to view professionals assigned to them via client_team_assignments
CREATE POLICY "Clients can view assigned professionals (no recursion)"
ON professionals
FOR SELECT
USING (
  -- Allow a professional to select their own profile row
  auth.uid() = user_id
  OR
  -- Allow clients to view professionals assigned to them
  EXISTS (
    SELECT 1
    FROM client_profiles cp
    WHERE cp.user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM client_team_assignments cta
        WHERE cta.client_id = cp.id
          AND cta.professional_id = professionals.id
          AND cta.status = 'active'
      )
  )
);
