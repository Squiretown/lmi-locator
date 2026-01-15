-- Fix the overly strict constraint on user_invitations
ALTER TABLE user_invitations DROP CONSTRAINT IF EXISTS professional_fields_check;
ALTER TABLE user_invitations ADD CONSTRAINT professional_fields_check
CHECK (
  (user_type IN ('realtor', 'mortgage_professional') AND professional_type IS NOT NULL) OR
  (user_type = 'client')
);