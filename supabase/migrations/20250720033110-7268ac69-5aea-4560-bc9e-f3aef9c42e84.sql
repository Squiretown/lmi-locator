
-- Add missing foreign key constraints for professional_teams table
ALTER TABLE public.professional_teams 
ADD CONSTRAINT professional_teams_realtor_id_fkey 
FOREIGN KEY (realtor_id) REFERENCES public.professionals(id) ON DELETE CASCADE;

ALTER TABLE public.professional_teams 
ADD CONSTRAINT professional_teams_mortgage_professional_id_fkey 
FOREIGN KEY (mortgage_professional_id) REFERENCES public.professionals(id) ON DELETE CASCADE;

-- Add missing foreign key constraint for client_team_assignments table
ALTER TABLE public.client_team_assignments 
ADD CONSTRAINT client_team_assignments_professional_id_fkey 
FOREIGN KEY (professional_id) REFERENCES public.professionals(id) ON DELETE CASCADE;

-- Update RLS policies to work with the new foreign key constraints
DROP POLICY IF EXISTS "Mortgage professionals can manage their teams" ON public.professional_teams;
DROP POLICY IF EXISTS "Professionals can view their teams" ON public.professional_teams;

-- Create updated RLS policies that properly handle the professional relationships
CREATE POLICY "Professionals can manage teams they're part of" 
ON public.professional_teams 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.user_id = auth.uid() 
    AND (p.id = mortgage_professional_id OR p.id = realtor_id)
  )
);

-- Update client_team_assignments RLS policies
DROP POLICY IF EXISTS "Professionals can manage their client assignments" ON public.client_team_assignments;
DROP POLICY IF EXISTS "Professionals can view their client assignments" ON public.client_team_assignments;

CREATE POLICY "Professionals can manage client assignments" 
ON public.client_team_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals p 
    WHERE p.user_id = auth.uid() 
    AND (p.id = professional_id OR p.id = assigned_by)
  )
);
