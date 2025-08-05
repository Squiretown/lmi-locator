-- Final migration step: Create triggers and complete the setup

-- Create triggers for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, user_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')
  );
  
  -- Create professional profile if user is a professional
  IF NEW.raw_user_meta_data->>'user_type' = 'realtor' THEN
    INSERT INTO public.realtors (
      user_id, name, company, license_number, email
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', 'New Realtor'),
      COALESCE(NEW.raw_user_meta_data->>'company', 'Not Specified'),
      COALESCE(NEW.raw_user_meta_data->>'license_number', 'Pending'),
      NEW.email
    );
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'mortgage_professional' THEN
    INSERT INTO public.mortgage_professionals (
      user_id, name, company, license_number, email
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', 'New Mortgage Professional'),
      COALESCE(NEW.raw_user_meta_data->>'company', 'Not Specified'),
      COALESCE(NEW.raw_user_meta_data->>'license_number', 'Pending'),
      NEW.email
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_realtors_user_id ON public.realtors(user_id);
CREATE INDEX IF NOT EXISTS idx_realtors_status ON public.realtors(status);
CREATE INDEX IF NOT EXISTS idx_mortgage_professionals_user_id ON public.mortgage_professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_professionals_status ON public.mortgage_professionals(status);