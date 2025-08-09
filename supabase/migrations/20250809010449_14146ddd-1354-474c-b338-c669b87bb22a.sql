-- Create professional_teams table for realtor partnerships
CREATE TABLE IF NOT EXISTS public.professional_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mortgage_professional_id UUID NOT NULL,
  realtor_id UUID NOT NULL,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mortgage_professional_id, realtor_id)
);

-- Enable RLS
ALTER TABLE public.professional_teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Professionals can view their team relationships"
ON public.professional_teams
FOR SELECT
USING (
  mortgage_professional_id = auth.uid() OR 
  realtor_id = auth.uid()
);

CREATE POLICY "Professionals can create team relationships"
ON public.professional_teams
FOR INSERT
WITH CHECK (
  mortgage_professional_id = auth.uid()
);

CREATE POLICY "Professionals can update their team relationships"
ON public.professional_teams
FOR UPDATE
USING (
  mortgage_professional_id = auth.uid() OR 
  realtor_id = auth.uid()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_professional_teams_mortgage_professional 
ON public.professional_teams(mortgage_professional_id);

CREATE INDEX IF NOT EXISTS idx_professional_teams_realtor 
ON public.professional_teams(realtor_id);

-- Create trigger for updated_at
CREATE TRIGGER update_professional_teams_updated_at
BEFORE UPDATE ON public.professional_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp_column();