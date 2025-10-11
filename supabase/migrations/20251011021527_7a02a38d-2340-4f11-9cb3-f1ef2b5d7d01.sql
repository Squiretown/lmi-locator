-- Create team_member_visibility table for team-owner-specific visibility preferences
CREATE TABLE IF NOT EXISTS team_member_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  visible_to_clients boolean NOT NULL DEFAULT true,
  showcase_role text,
  showcase_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_owner_id, professional_id)
);

-- Enable RLS
ALTER TABLE team_member_visibility ENABLE ROW LEVEL SECURITY;

-- RLS policies: Users can only manage their own team visibility settings
CREATE POLICY "Users can manage their own team visibility settings"
ON team_member_visibility
FOR ALL
USING (auth.uid() = team_owner_id)
WITH CHECK (auth.uid() = team_owner_id);