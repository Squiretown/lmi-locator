-- Check if professional_teams table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'professional_teams') THEN
        CREATE TABLE professional_teams (
            id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            mortgage_professional_id uuid NOT NULL,
            realtor_id uuid NOT NULL,
            relationship_type text NOT NULL DEFAULT 'partner',
            status text NOT NULL DEFAULT 'active',
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now(),
            created_by uuid,
            notes text,
            permissions jsonb DEFAULT '[]'::jsonb
        );

        -- Add RLS
        ALTER TABLE professional_teams ENABLE ROW LEVEL SECURITY;

        -- Add policies
        CREATE POLICY "Professionals can view their team relationships" 
        ON professional_teams 
        FOR SELECT 
        USING ((mortgage_professional_id = auth.uid()) OR (realtor_id = auth.uid()));

        CREATE POLICY "Mortgage professionals can manage their teams" 
        ON professional_teams 
        FOR ALL 
        USING (mortgage_professional_id = auth.uid());

        -- Add indexes
        CREATE INDEX idx_professional_teams_mortgage_prof ON professional_teams(mortgage_professional_id);
        CREATE INDEX idx_professional_teams_realtor ON professional_teams(realtor_id);
        CREATE INDEX idx_professional_teams_status ON professional_teams(status);

        -- Add foreign key constraints
        ALTER TABLE professional_teams 
        ADD CONSTRAINT fk_professional_teams_mortgage_prof 
        FOREIGN KEY (mortgage_professional_id) 
        REFERENCES professionals(id) ON DELETE CASCADE;

        ALTER TABLE professional_teams 
        ADD CONSTRAINT fk_professional_teams_realtor 
        FOREIGN KEY (realtor_id) 
        REFERENCES professionals(id) ON DELETE CASCADE;

        -- Add unique constraint to prevent duplicate relationships
        ALTER TABLE professional_teams 
        ADD CONSTRAINT unique_professional_team_relationship 
        UNIQUE (mortgage_professional_id, realtor_id);

        -- Add updated_at trigger
        CREATE TRIGGER update_professional_teams_updated_at
        BEFORE UPDATE ON professional_teams
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp_column();
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'professional_teams' AND column_name = 'role') THEN
        ALTER TABLE professional_teams ADD COLUMN role text DEFAULT 'partner';
    END IF;
END $$;