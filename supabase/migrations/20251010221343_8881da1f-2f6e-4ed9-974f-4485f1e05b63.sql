-- Add professional contact management columns to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS professional_type TEXT,
ADD COLUMN IF NOT EXISTS role_title TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS visible_to_clients BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_system_access BOOLEAN DEFAULT false;

-- Add constraint for professional_type
ALTER TABLE contacts 
ADD CONSTRAINT contacts_professional_type_check 
CHECK (professional_type IN (
  'attorney', 
  'title_company', 
  'inspector', 
  'appraiser', 
  'insurance', 
  'contractor', 
  'other',
  'realtor',
  'mortgage_professional',
  NULL
));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_professional_type ON contacts(professional_type);
CREATE INDEX IF NOT EXISTS idx_contacts_visible_to_clients ON contacts(visible_to_clients);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_visible ON contacts(owner_id, visible_to_clients) WHERE visible_to_clients = true;