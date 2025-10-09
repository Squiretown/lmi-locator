-- Add unique constraint on user_profiles.user_id to support ON CONFLICT
-- This is required for the handle_new_user() trigger function

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);