-- Enable RLS on spatial_ref_sys table which is used by PostGIS
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to spatial reference systems
CREATE POLICY "Allow public read access to spatial reference systems" 
ON public.spatial_ref_sys FOR SELECT 
USING (true);