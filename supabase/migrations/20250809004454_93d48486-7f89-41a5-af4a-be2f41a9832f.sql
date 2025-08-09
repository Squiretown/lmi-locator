-- Add missing columns and constraints for invitation flow
ALTER TABLE client_invitations 
ADD COLUMN IF NOT EXISTS accepted_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS duplicate_check_key text GENERATED ALWAYS AS (
  CASE 
    WHEN status = 'revoked' THEN NULL
    WHEN status = 'expired' THEN NULL
    ELSE LOWER(client_email) || '-' || professional_id::text
  END
) STORED;

-- Create unique constraint to prevent duplicate active invitations
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_invitations 
ON client_invitations (duplicate_check_key) 
WHERE duplicate_check_key IS NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_invitations_code ON client_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_client_invitations_email ON client_invitations(client_email);
CREATE INDEX IF NOT EXISTS idx_client_invitations_status ON client_invitations(status);

-- Create professional_teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS professional_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mortgage_professional_id uuid NOT NULL REFERENCES auth.users(id),
  realtor_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(mortgage_professional_id, realtor_id)
);

-- Enable RLS on professional_teams
ALTER TABLE professional_teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for professional_teams
CREATE POLICY "Team members can view their teams" ON professional_teams
FOR SELECT USING (
  auth.uid() = mortgage_professional_id OR 
  auth.uid() = realtor_id
);

CREATE POLICY "Users can create team relationships" ON professional_teams
FOR INSERT WITH CHECK (
  auth.uid() = mortgage_professional_id OR 
  auth.uid() = realtor_id
);

-- Create function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE client_invitations 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$$;