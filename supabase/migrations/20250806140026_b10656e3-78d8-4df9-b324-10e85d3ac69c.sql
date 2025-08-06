-- Remove redundant type field and add constraints to professional_type
ALTER TABLE professionals DROP COLUMN IF EXISTS type;

-- Add check constraint for professional_type
ALTER TABLE professionals 
ADD CONSTRAINT check_professional_type 
CHECK (professional_type IN ('realtor', 'mortgage_professional'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_professionals_type ON professionals(professional_type);