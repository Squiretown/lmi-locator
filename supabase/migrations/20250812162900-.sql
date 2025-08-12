-- Create security definer function to get current user's professional ID
CREATE OR REPLACE FUNCTION public.get_current_professional_id()
RETURNS UUID AS $$
  SELECT id FROM public.professionals WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing policies on client_profiles
DROP POLICY IF EXISTS "Professionals can insert client profiles" ON public.client_profiles;
DROP POLICY IF EXISTS "Professionals can update their clients" ON public.client_profiles;
DROP POLICY IF EXISTS "Professionals can delete their clients" ON public.client_profiles;
DROP POLICY IF EXISTS "Users manage their client profiles" ON public.client_profiles;

-- Create new policies using the security definer function
CREATE POLICY "Professionals can insert client profiles" 
ON public.client_profiles 
FOR INSERT 
WITH CHECK (professional_id = public.get_current_professional_id());

CREATE POLICY "Professionals can view their clients" 
ON public.client_profiles 
FOR SELECT 
USING (professional_id = public.get_current_professional_id());

CREATE POLICY "Professionals can update their clients" 
ON public.client_profiles 
FOR UPDATE 
USING (professional_id = public.get_current_professional_id());

CREATE POLICY "Professionals can delete their clients" 
ON public.client_profiles 
FOR DELETE 
USING (professional_id = public.get_current_professional_id());

-- Add unique constraint to ensure one professional profile per user
ALTER TABLE public.professionals 
ADD CONSTRAINT unique_user_professional 
UNIQUE (user_id);