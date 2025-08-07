-- Create security definer function to get current user's professional ID
CREATE OR REPLACE FUNCTION public.get_current_professional_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.professionals 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop and recreate the client_invitations RLS policy with correct logic
DROP POLICY IF EXISTS "Professionals can manage their client invitations" ON public.client_invitations;

CREATE POLICY "Professionals can manage their client invitations" 
ON public.client_invitations 
FOR ALL 
USING (professional_id = public.get_current_professional_id())
WITH CHECK (professional_id = public.get_current_professional_id());