-- Create lending_teams table for managing direct team relationships
CREATE TABLE public.lending_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_leader_id UUID NOT NULL,
  team_member_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'team_member',
  permissions JSONB DEFAULT '{"can_view_clients": true, "can_edit_clients": false}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_leader_id, team_member_id)
);

-- Enable RLS
ALTER TABLE public.lending_teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Team leaders can manage their teams"
ON public.lending_teams 
FOR ALL
USING (
  team_leader_id IN (
    SELECT id FROM professionals 
    WHERE user_id = auth.uid() AND professional_type = 'mortgage_professional'
  )
);

CREATE POLICY "Team members can view their team assignments"
ON public.lending_teams 
FOR SELECT
USING (
  team_member_id IN (
    SELECT id FROM professionals 
    WHERE user_id = auth.uid() AND professional_type = 'mortgage_professional'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_lending_teams_updated_at
  BEFORE UPDATE ON public.lending_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp_column();

-- Add team_id to client_invitations for team context
ALTER TABLE public.client_invitations 
ADD COLUMN lending_team_id UUID REFERENCES public.lending_teams(id);

-- Add team_invitation_type to track different invitation types
ALTER TABLE public.client_invitations 
ADD COLUMN invitation_category TEXT DEFAULT 'client' CHECK (invitation_category IN ('client', 'lending_team', 'realtor_partnership'));