-- Add assignment and notes columns to contact_inquiries table
ALTER TABLE contact_inquiries 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES professionals(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_assigned_to 
ON contact_inquiries(assigned_to);