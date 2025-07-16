-- Drop existing problematic policies on user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create simple, non-recursive RLS policies for user_profiles
CREATE POLICY "Enable read access for users to their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users to create their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users to update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Also fix the function search path warnings
CREATE OR REPLACE FUNCTION public.update_theme_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type',
    'client'
  );
$function$;