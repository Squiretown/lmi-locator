-- Create the ffiec-uploads storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ffiec-uploads', 'ffiec-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the ffiec-uploads bucket
CREATE POLICY "Allow authenticated users to upload FFIEC files"
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'ffiec-uploads');

CREATE POLICY "Allow authenticated users to view FFIEC uploads"
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'ffiec-uploads');

CREATE POLICY "Allow authenticated users to delete FFIEC uploads"
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'ffiec-uploads');

-- Add the user_is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin'),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update RLS policies for census_tracts to allow admin operations
DROP POLICY IF EXISTS "Admin write access to census tracts" ON public.census_tracts;
CREATE POLICY "Admin write access to census tracts" 
ON public.census_tracts FOR ALL 
TO authenticated 
USING (user_is_admin()) 
WITH CHECK (user_is_admin());

-- Ensure ffiec_import_jobs table has proper RLS policies
DROP POLICY IF EXISTS "Admins can manage FFIEC import jobs" ON public.ffiec_import_jobs;
CREATE POLICY "Admins can manage FFIEC import jobs"
ON public.ffiec_import_jobs FOR ALL
TO authenticated 
USING (user_is_admin())
WITH CHECK (user_is_admin());