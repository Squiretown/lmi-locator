-- 1) Deduplicate user_profiles by user_id (keep the most recent by created_at if present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'created_at'
  ) THEN
    DELETE FROM public.user_profiles up
    USING (
      SELECT ctid, row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC NULLS LAST, ctid) AS rn
      FROM public.user_profiles
    ) d
    WHERE up.ctid = d.ctid AND d.rn > 1;
  ELSE
    DELETE FROM public.user_profiles up
    USING (
      SELECT ctid, row_number() OVER (PARTITION BY user_id ORDER BY ctid) AS rn
      FROM public.user_profiles
    ) d
    WHERE up.ctid = d.ctid AND d.rn > 1;
  END IF;
END $$;

-- 2) Ensure unique constraint on user_profiles.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- 3) Fix the trigger function to stop referencing a non-existent email column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    user_type,
    first_name,
    last_name
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;