-- Fix RLS policy that was causing "permission denied for table users" error
-- The issue is that we can't query auth.users directly in RLS policies

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view invitations they received" ON user_invitations;

-- Recreate it using auth.email() instead of querying auth.users
CREATE POLICY "Users can view invitations they received"
ON user_invitations
FOR SELECT
USING (
  email = auth.email()
);