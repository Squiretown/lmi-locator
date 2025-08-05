-- Fix RLS security warnings - Enable RLS on tables that don't have it
-- Check which tables need RLS enabled

-- Enable RLS on geometry_columns and geography_columns (PostGIS tables)
-- These are system tables that should have restricted access
ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for PostGIS system tables (read-only for authenticated users)
CREATE POLICY "authenticated_read_geometry_columns" ON public.geometry_columns
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_read_geography_columns" ON public.geography_columns  
FOR SELECT USING (auth.uid() IS NOT NULL);