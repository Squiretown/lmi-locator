-- Add check constraints to ensure consistent role values across the system

-- Update professionals table to enforce valid professional_type values
ALTER TABLE public.professionals 
DROP CONSTRAINT IF EXISTS professionals_professional_type_check;

ALTER TABLE public.professionals 
ADD CONSTRAINT professionals_professional_type_check 
CHECK (professional_type IN ('realtor', 'mortgage_professional'));

-- Update client_team_assignments to enforce valid professional_role values  
ALTER TABLE public.client_team_assignments
DROP CONSTRAINT IF EXISTS client_team_assignments_professional_role_check;

ALTER TABLE public.client_team_assignments
ADD CONSTRAINT client_team_assignments_professional_role_check
CHECK (professional_role IN ('realtor', 'mortgage_professional'));

-- Update client_invitations to enforce valid target_professional_role values
ALTER TABLE public.client_invitations
DROP CONSTRAINT IF EXISTS client_invitations_target_professional_role_check;

ALTER TABLE public.client_invitations
ADD CONSTRAINT client_invitations_target_professional_role_check
CHECK (target_professional_role IS NULL OR target_professional_role IN ('realtor', 'mortgage_professional'));

-- Create a function to normalize legacy role data
CREATE OR REPLACE FUNCTION normalize_professional_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Normalize professionals table
  UPDATE public.professionals 
  SET professional_type = 'mortgage_professional' 
  WHERE professional_type IN ('mortgage', 'mortgage_broker');
  
  -- Normalize client_team_assignments
  UPDATE public.client_team_assignments 
  SET professional_role = 'mortgage_professional' 
  WHERE professional_role IN ('mortgage', 'mortgage_broker');
  
  -- Normalize client_invitations
  UPDATE public.client_invitations 
  SET target_professional_role = 'mortgage_professional' 
  WHERE target_professional_role IN ('mortgage', 'mortgage_broker');
  
  -- Log the normalization
  INSERT INTO public.activity_logs (activity_type, description, data) 
  VALUES ('system', 'Professional role normalization completed', 
          jsonb_build_object('timestamp', now(), 'action', 'role_standardization'));
END;
$$;

-- Execute the normalization function
SELECT normalize_professional_roles();

-- Drop the function as it's only needed for migration
DROP FUNCTION normalize_professional_roles();