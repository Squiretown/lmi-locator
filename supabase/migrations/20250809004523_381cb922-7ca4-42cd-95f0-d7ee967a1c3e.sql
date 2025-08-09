-- First, let's check for and remove duplicate active invitations
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(client_email), professional_id 
      ORDER BY created_at DESC
    ) as rn
  FROM client_invitations 
  WHERE status IN ('pending', 'sent')
)
UPDATE client_invitations 
SET status = 'revoked'
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add missing columns
ALTER TABLE client_invitations 
ADD COLUMN IF NOT EXISTS accepted_by uuid REFERENCES auth.users(id);

-- Now add the duplicate check key column
ALTER TABLE client_invitations 
ADD COLUMN IF NOT EXISTS duplicate_check_key text GENERATED ALWAYS AS (
  CASE 
    WHEN status IN ('revoked', 'expired', 'accepted') THEN NULL
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