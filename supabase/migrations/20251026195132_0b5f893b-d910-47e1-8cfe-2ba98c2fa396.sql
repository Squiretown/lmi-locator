-- Fix recursive RLS on professionals by replacing with safe policies
-- Drop potentially problematic existing SELECT policies on professionals
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'professionals' AND policyname = 'Allow select with recursive join'
  ) THEN
    EXECUTE 'DROP POLICY "Allow select with recursive join" ON public.professionals';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'professionals' AND policyname = 'Professionals are viewable by everyone'
  ) THEN
    EXECUTE 'DROP POLICY "Professionals are viewable by everyone" ON public.professionals';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'professionals' AND policyname = 'Public read for professionals'
  ) THEN
    EXECUTE 'DROP POLICY "Public read for professionals" ON public.professionals';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'professionals' AND policyname = 'Allow authenticated select on professionals'
  ) THEN
    EXECUTE 'DROP POLICY "Allow authenticated select on professionals" ON public.professionals';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'professionals' AND policyname = 'Clients can view assigned professionals'
  ) THEN
    EXECUTE 'DROP POLICY "Clients can view assigned professionals" ON public.professionals';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'professionals' AND policyname = 'Professional can view own record'
  ) THEN
    EXECUTE 'DROP POLICY "Professional can view own record" ON public.professionals';
  END IF;
END
$$;

-- Ensure RLS is enabled
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Clients can view professionals assigned to them via client_team_assignments
CREATE POLICY "Clients can view assigned professionals"
ON public.professionals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.client_team_assignments cta
    JOIN public.client_profiles cp ON cp.id = cta.client_id
    WHERE cta.professional_id = professionals.id
      AND cp.user_id = auth.uid()
      AND cta.status = 'active'
  )
);

-- Professionals can view their own professional record
CREATE POLICY "Professional can view own record"
ON public.professionals
FOR SELECT
TO authenticated
USING (professionals.id = auth.uid());