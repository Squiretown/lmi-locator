-- Create professional_teams table to link mortgage professionals with realtors
CREATE TABLE public.professional_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mortgage_professional_id UUID NOT NULL,
  realtor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  UNIQUE(mortgage_professional_id, realtor_id)
);

-- Create client_team_assignments table for multi-professional client management
CREATE TABLE public.client_team_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  professional_role TEXT NOT NULL, -- 'mortgage' or 'realtor'
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(client_id, professional_id, professional_role)
);

-- Add invitation target type to client_invitations
ALTER TABLE public.client_invitations 
ADD COLUMN invitation_target_type TEXT NOT NULL DEFAULT 'client',
ADD COLUMN target_professional_role TEXT,
ADD COLUMN team_context JSONB;

-- Enable RLS on new tables
ALTER TABLE public.professional_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_team_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for professional_teams
CREATE POLICY "Professionals can view their teams" 
ON public.professional_teams 
FOR SELECT 
USING (
  mortgage_professional_id = auth.uid() OR 
  realtor_id = auth.uid()
);

CREATE POLICY "Mortgage professionals can manage their teams" 
ON public.professional_teams 
FOR ALL 
USING (mortgage_professional_id = auth.uid());

-- RLS policies for client_team_assignments  
CREATE POLICY "Professionals can view their client assignments" 
ON public.client_team_assignments 
FOR SELECT 
USING (professional_id = auth.uid());

CREATE POLICY "Professionals can manage their client assignments" 
ON public.client_team_assignments 
FOR ALL 
USING (assigned_by = auth.uid() OR professional_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_professional_teams_mortgage ON public.professional_teams(mortgage_professional_id);
CREATE INDEX idx_professional_teams_realtor ON public.professional_teams(realtor_id);
CREATE INDEX idx_client_team_assignments_client ON public.client_team_assignments(client_id);
CREATE INDEX idx_client_team_assignments_professional ON public.client_team_assignments(professional_id);