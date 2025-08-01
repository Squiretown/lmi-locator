-- Fix the user_is_admin function by adding proper search path
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin'),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Enable RLS on any tables that might be missing it (checking common tables)
DO $$
BEGIN
  -- Enable RLS on spatial_ref_sys if it exists and doesn't have RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys') THEN
    EXECUTE 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Allow public read access to spatial_ref_sys" ON public.spatial_ref_sys FOR SELECT USING (true)';
  END IF;
  
  -- Check other common tables that might need RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geography_columns') THEN
    EXECUTE 'ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Allow public read access to geography_columns" ON public.geography_columns FOR SELECT USING (true)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geometry_columns') THEN
    EXECUTE 'ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Allow public read access to geometry_columns" ON public.geometry_columns FOR SELECT USING (true)';
  END IF;
EXCEPTION 
  WHEN OTHERS THEN
    -- Ignore errors if tables don't exist or policies already exist
    NULL;
END $$;