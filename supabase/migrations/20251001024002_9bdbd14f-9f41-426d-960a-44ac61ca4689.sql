-- First, let's drop ALL existing policies on user_invitations to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_invitations' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_invitations';
    END LOOP;
END $$;

-- Create secure RLS policies for user_invitations

-- Allow users to view invitations they sent
CREATE POLICY "Users can view invitations they sent"
ON user_invitations
FOR SELECT
USING (invited_by_user_id = auth.uid());

-- Allow users to view invitations they received (by email)
CREATE POLICY "Users can view invitations they received"
ON user_invitations
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow admins to view all invitations
CREATE POLICY "Admins can view all invitations"
ON user_invitations
FOR SELECT
USING (user_is_admin());

-- Allow users to create invitations
CREATE POLICY "Users can create invitations"
ON user_invitations
FOR INSERT
WITH CHECK (invited_by_user_id = auth.uid());

-- Allow users to update invitations they sent (before acceptance)
CREATE POLICY "Users can update their sent invitations"
ON user_invitations
FOR UPDATE
USING (
  invited_by_user_id = auth.uid() 
  AND accepted_at IS NULL
);

-- Allow admins to manage all invitations
CREATE POLICY "Admins can manage all invitations"
ON user_invitations
FOR ALL
USING (user_is_admin())
WITH CHECK (user_is_admin());