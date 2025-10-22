-- Fix infinite recursion in RLS policy for professionals table
-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Clients can view assigned professionals" ON professionals;

-- Create new policy that avoids recursion by using simple EXISTS checks
CREATE POLICY "Clients can view their assigned professionals" 
ON professionals 
FOR SELECT 
USING (
  -- Allow if user is viewing their own professional profile
  auth.uid() = user_id
  OR
  -- Allow if there's an active assignment linking this client to this professional
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
  OR
  -- Allow if user is a professional (checking from another table to avoid recursion)
  EXISTS (
    SELECT 1
    FROM professionals p
    WHERE p.user_id = auth.uid()
  )
);