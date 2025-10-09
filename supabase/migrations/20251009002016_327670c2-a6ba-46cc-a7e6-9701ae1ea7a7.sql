-- Allow public validation of invitations by token (for accepting invitations before login)
CREATE POLICY "Anyone can validate invitation by token"
ON user_invitations
FOR SELECT
TO public
USING (
  invite_token IS NOT NULL 
  AND status = 'pending'
  AND expires_at > now()
);