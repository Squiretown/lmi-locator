-- Create a function to ensure users have professional profiles
CREATE OR REPLACE FUNCTION public.ensure_professional_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert professional profiles for users without them
  -- This creates basic profiles that users can complete later
  INSERT INTO public.professionals (
    user_id,
    professional_type,
    name,
    company,
    license_number,
    status,
    created_at,
    last_updated
  )
  SELECT 
    au.id,
    COALESCE(
      (au.raw_user_meta_data->>'user_type')::text,
      'mortgage_professional'
    ) as professional_type,
    COALESCE(
      TRIM(CONCAT(
        COALESCE(au.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(au.raw_user_meta_data->>'last_name', '')
      )),
      SPLIT_PART(au.email, '@', 1)
    ) as name,
    COALESCE(
      (au.raw_user_meta_data->>'company')::text,
      'Company Name'
    ) as company,
    COALESCE(
      (au.raw_user_meta_data->>'license_number')::text,
      ''
    ) as license_number,
    'active' as status,
    au.created_at,
    NOW()
  FROM auth.users au
  LEFT JOIN public.professionals p ON p.user_id = au.id
  WHERE p.user_id IS NULL
    AND au.email_confirmed_at IS NOT NULL;
END;
$$;

-- Create a trigger to automatically create professional profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_professional_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create professional profile for confirmed users
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    INSERT INTO public.professionals (
      user_id,
      professional_type,
      name,
      company,
      license_number,
      status,
      created_at,
      last_updated
    ) VALUES (
      NEW.id,
      COALESCE(
        (NEW.raw_user_meta_data->>'user_type')::text,
        'mortgage_professional'
      ),
      COALESCE(
        TRIM(CONCAT(
          COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
          ' ',
          COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        )),
        SPLIT_PART(NEW.email, '@', 1)
      ),
      COALESCE(
        (NEW.raw_user_meta_data->>'company')::text,
        'Company Name'
      ),
      COALESCE(
        (NEW.raw_user_meta_data->>'license_number')::text,
        ''
      ),
      'active',
      NEW.created_at,
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_confirmed_professional_profile ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_professional_profile
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_professional_profile();

-- Run the function to create profiles for existing users
SELECT public.ensure_professional_profile();