
-- Fix overly permissive RLS policies on professionals table
-- Remove the broad "Users can view professionals" policy
DROP POLICY IF EXISTS "Users can view professionals" ON professionals;

-- Create more restrictive policies
-- 1. Professionals can view other professionals (for team/networking features)
CREATE POLICY "Professionals can view other professionals"
ON professionals
FOR SELECT
TO public
USING (
  -- Current user is a professional (has their own professional record)
  EXISTS (
    SELECT 1 FROM professionals p2 
    WHERE p2.user_id = auth.uid()
  )
);

-- 2. Keep the existing "Clients can view assigned professionals" policy (already exists)
-- 3. Keep the existing policies for professionals to manage their own records (already exist)

-- Note: The existing policies remain:
-- - "Users can view their own professional profile" (auth.uid() = user_id)
-- - "Clients can view assigned professionals" (via client_team_assignments)
-- - "Users can insert/update/delete professionals" (their own records)
