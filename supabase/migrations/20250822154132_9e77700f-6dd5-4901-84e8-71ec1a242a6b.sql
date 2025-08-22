
-- 1) Drop the old FK (to auth.users)
ALTER TABLE public.client_profiles
  DROP CONSTRAINT IF EXISTS client_profiles_professional_id_fkey;

-- 2) Backfill: convert stored auth user IDs to professionals.id
--    This safely updates existing rows to match the new relationship
UPDATE public.client_profiles AS cp
SET professional_id = p.id
FROM public.professionals AS p
WHERE cp.professional_id = p.user_id;

-- 3) Add the new FK (to public.professionals)
ALTER TABLE public.client_profiles
  ADD CONSTRAINT client_profiles_professional_id_fkey
  FOREIGN KEY (professional_id)
  REFERENCES public.professionals(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- 4) Ensure an index exists for performance
CREATE INDEX IF NOT EXISTS idx_client_profiles_professional_id
  ON public.client_profiles(professional_id);
