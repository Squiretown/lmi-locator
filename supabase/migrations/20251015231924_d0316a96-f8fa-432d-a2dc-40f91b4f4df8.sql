-- Create function to safely allow clients to view assigned professionals without recursion
CREATE OR REPLACE FUNCTION public.client_can_view_assigned_professional(p_professional_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.client_profiles cp
    JOIN public.client_team_assignments cta ON cta.client_id = cp.id
    WHERE cp.user_id = auth.uid()
      AND cta.professional_id = p_professional_id
      AND cta.status = 'active'
  );
END;
$$;

-- Policy: Clients can view professionals who are assigned to them
DROP POLICY IF EXISTS "Clients can view assigned professionals" ON public.professionals;
CREATE POLICY "Clients can view assigned professionals"
ON public.professionals
FOR SELECT
USING (public.client_can_view_assigned_professional(id));
