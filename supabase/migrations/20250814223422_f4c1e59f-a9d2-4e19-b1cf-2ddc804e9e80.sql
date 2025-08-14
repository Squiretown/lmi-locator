-- Phase 1: Fix the current data issue for Christine & Shawn
-- Update the invitation status and create the missing team relationship

-- Update the invitation status to accepted
UPDATE client_invitations 
SET status = 'accepted',
    accepted_at = now(),
    accepted_by = 'b610fff0-e9ca-4661-9606-4243c5c8d14a',
    updated_at = now()
WHERE id = '1b1b8c68-c2a6-424d-8133-9ab95019dee2';

-- Create the missing professional_teams relationship
INSERT INTO professional_teams (
  mortgage_professional_id,
  realtor_id,
  role,
  status,
  created_at
) VALUES (
  'c27ad5ac-01de-4e75-b1b0-9bdfbed90153',
  '48cecb6a-a981-4d23-ae15-7ef8bd6ac359',
  'partner',
  'active',
  now()
);