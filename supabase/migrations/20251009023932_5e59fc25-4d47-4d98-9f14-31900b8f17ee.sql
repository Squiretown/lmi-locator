-- Fix unique_pending_invitation constraint to only apply to pending invitations
-- This allows multiple cancelled/expired invitations for the same email

ALTER TABLE public.user_invitations
DROP CONSTRAINT unique_pending_invitation;

-- Create a partial unique index that only applies to pending invitations
CREATE UNIQUE INDEX unique_pending_invitation 
ON public.user_invitations(email, user_type) 
WHERE status = 'pending';