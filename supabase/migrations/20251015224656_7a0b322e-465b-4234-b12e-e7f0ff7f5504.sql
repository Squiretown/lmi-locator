-- Allow clients to view professionals assigned to them
DROP POLICY IF EXISTS "Clients can view assigned professionals" ON professionals;

CREATE POLICY "Clients can view assigned professionals"
ON professionals
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM client_team_assignments cta
    JOIN client_profiles cp ON cp.id = cta.client_id
    WHERE cta.professional_id = professionals.id
      AND cp.user_id = auth.uid()
  )
  OR public.is_admin_user_safe()
);
