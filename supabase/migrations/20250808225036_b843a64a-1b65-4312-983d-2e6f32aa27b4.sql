-- Add missing first_name and last_name columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Update the user creation trigger to properly populate first_name and last_name
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
  );
  
  RETURN NEW;
END;
$$;

-- Backfill existing user_profiles with missing data from auth.users metadata
UPDATE user_profiles 
SET 
  first_name = (SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = user_profiles.user_id),
  last_name = (SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = user_profiles.user_id)
WHERE first_name IS NULL OR last_name IS NULL;