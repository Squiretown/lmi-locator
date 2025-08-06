-- Streamline professional signup by consolidating tables and simplifying triggers

-- Step 1: Remove the problematic handle_new_user_signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Step 2: Create a simple trigger that only creates user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create user profile with basic info
  INSERT INTO public.user_profiles (user_id, user_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')
  );
  
  RETURN NEW;
END;
$function$;

-- Create the new simplified trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Ensure professionals table has professional_type field
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS professional_type text;

-- Update existing professionals to have professional_type based on type field
UPDATE public.professionals 
SET professional_type = type 
WHERE professional_type IS NULL AND type IS NOT NULL;

-- Step 4: Drop the separate realtor and mortgage professional tables
DROP TABLE IF EXISTS public.realtors CASCADE;
DROP TABLE IF EXISTS public.mortgage_professionals CASCADE;

-- Step 5: Update professionals table constraints
ALTER TABLE public.professionals 
DROP CONSTRAINT IF EXISTS professionals_type_check;

-- Add constraint for professional_type
ALTER TABLE public.professionals 
ADD CONSTRAINT professionals_professional_type_check 
CHECK (professional_type IN ('realtor', 'mortgage_professional'));

-- Make professional_type required
ALTER TABLE public.professionals 
ALTER COLUMN professional_type SET NOT NULL;