-- Phase 1: FFIEC Database Schema Enhancement
-- Enhance existing census_tracts table with FFIEC-specific fields

-- Add FFIEC columns to existing census_tracts table
ALTER TABLE public.census_tracts 
ADD COLUMN IF NOT EXISTS income_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS msa_md_median_income DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS tract_median_family_income DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS ami_percentage DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS is_lmi_eligible BOOLEAN,
ADD COLUMN IF NOT EXISTS ffiec_data_year INTEGER DEFAULT 2025,
ADD COLUMN IF NOT EXISTS geometry GEOMETRY(MULTIPOLYGON, 4326),
ADD COLUMN IF NOT EXISTS centroid_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS centroid_lng DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS tract_population INTEGER,
ADD COLUMN IF NOT EXISTS minority_population_pct DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS owner_occupied_units INTEGER;

-- Add performance indexes for FFIEC queries
CREATE INDEX IF NOT EXISTS idx_census_tracts_income_level ON public.census_tracts(income_level);
CREATE INDEX IF NOT EXISTS idx_census_tracts_lmi_eligible ON public.census_tracts(is_lmi_eligible);
CREATE INDEX IF NOT EXISTS idx_census_tracts_geometry ON public.census_tracts USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_census_tracts_ami_percentage ON public.census_tracts(ami_percentage);

-- Create FFIEC field definitions table
CREATE TABLE IF NOT EXISTS public.ffiec_field_definitions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    field_name VARCHAR(100) UNIQUE NOT NULL,
    field_description TEXT,
    data_type VARCHAR(50),
    valid_values TEXT[],
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create FFIEC geography codes table
CREATE TABLE IF NOT EXISTS public.ffiec_geography_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code_type VARCHAR(20) NOT NULL, -- 'state', 'county', 'msa'
    code_value VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create background jobs table for file processing
CREATE TABLE IF NOT EXISTS public.ffiec_import_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL, -- 'definitions', 'census_data'
    status VARCHAR(20) DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    records_total INTEGER DEFAULT 0,
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    file_name VARCHAR(255),
    file_size BIGINT,
    file_info JSONB,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.ffiec_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ffiec_geography_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ffiec_import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for FFIEC field definitions
CREATE POLICY "Public read access to FFIEC field definitions" 
ON public.ffiec_field_definitions FOR SELECT 
USING (true);

CREATE POLICY "Admin write access to FFIEC field definitions" 
ON public.ffiec_field_definitions FOR ALL 
USING (user_is_admin())
WITH CHECK (user_is_admin());

-- RLS policies for FFIEC geography codes
CREATE POLICY "Public read access to FFIEC geography codes" 
ON public.ffiec_geography_codes FOR SELECT 
USING (true);

CREATE POLICY "Admin write access to FFIEC geography codes" 
ON public.ffiec_geography_codes FOR ALL 
USING (user_is_admin())
WITH CHECK (user_is_admin());

-- RLS policies for FFIEC import jobs
CREATE POLICY "Admins can view all FFIEC import jobs" 
ON public.ffiec_import_jobs FOR SELECT 
USING (user_is_admin());

CREATE POLICY "Admins can manage FFIEC import jobs" 
ON public.ffiec_import_jobs FOR ALL 
USING (user_is_admin())
WITH CHECK (user_is_admin());

-- Create function to find census tract by coordinates (for FFIEC spatial queries)
CREATE OR REPLACE FUNCTION public.find_ffiec_tract_by_coords(
    lat DECIMAL(10,8),
    lng DECIMAL(11,8)
)
RETURNS TABLE (
    tract_id TEXT,
    income_level VARCHAR(20),
    is_lmi_eligible BOOLEAN,
    ami_percentage DECIMAL(6,2),
    tract_median_family_income DECIMAL(12,2),
    msa_md_median_income DECIMAL(12,2),
    ffiec_data_year INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ct.tract_id::TEXT,
        ct.income_level,
        ct.is_lmi_eligible,
        ct.ami_percentage,
        ct.tract_median_family_income,
        ct.msa_md_median_income,
        ct.ffiec_data_year
    FROM public.census_tracts ct
    WHERE ct.geometry IS NOT NULL
      AND ST_Contains(ct.geometry, ST_SetSRID(ST_Point(lng, lat), 4326))
    LIMIT 1;
END;
$$;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ffiec_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ffiec_field_definitions_updated_at
    BEFORE UPDATE ON public.ffiec_field_definitions
    FOR EACH ROW EXECUTE FUNCTION public.update_ffiec_updated_at();

CREATE TRIGGER update_ffiec_import_jobs_updated_at
    BEFORE UPDATE ON public.ffiec_import_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_ffiec_updated_at();

-- Insert some sample FFIEC field definitions
INSERT INTO public.ffiec_field_definitions (field_name, field_description, data_type, valid_values, is_required) VALUES
('tract_id', 'Census Tract Identifier (State + County + Tract)', 'VARCHAR(20)', NULL, true),
('income_level', 'FFIEC Income Classification', 'VARCHAR(20)', ARRAY['Low', 'Moderate', 'Middle', 'Upper'], true),
('ami_percentage', 'Area Median Income Percentage', 'DECIMAL(6,2)', NULL, false),
('msa_md_median_income', 'MSA/MD Median Family Income', 'DECIMAL(12,2)', NULL, false),
('tract_median_family_income', 'Tract Median Family Income', 'DECIMAL(12,2)', NULL, false),
('tract_population', 'Total Tract Population', 'INTEGER', NULL, false),
('minority_population_pct', 'Minority Population Percentage', 'DECIMAL(5,2)', NULL, false),
('owner_occupied_units', 'Owner Occupied Housing Units', 'INTEGER', NULL, false)
ON CONFLICT (field_name) DO NOTHING;