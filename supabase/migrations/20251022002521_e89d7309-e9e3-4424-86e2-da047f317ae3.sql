-- Add missing foreign key constraints for client_team_assignments table

-- Add foreign key constraint for professional_id
ALTER TABLE client_team_assignments
ADD CONSTRAINT client_team_assignments_professional_id_fkey
FOREIGN KEY (professional_id)
REFERENCES professionals(id)
ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_client_team_assignments_professional_id
ON client_team_assignments(professional_id);

-- Ensure the client_id foreign key exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'client_team_assignments_client_id_fkey'
  ) THEN
    ALTER TABLE client_team_assignments
    ADD CONSTRAINT client_team_assignments_client_id_fkey
    FOREIGN KEY (client_id)
    REFERENCES client_profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for client_id
CREATE INDEX IF NOT EXISTS idx_client_team_assignments_client_id
ON client_team_assignments(client_id);