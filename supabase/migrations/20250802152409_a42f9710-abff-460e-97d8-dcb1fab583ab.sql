-- Fix remaining security issues

-- Update all remaining functions with missing search_path
CREATE OR REPLACE FUNCTION public.find_census_tract_flexible(input_tract_id text)
RETURNS TABLE(tract_id character varying, state character varying, county character varying, tract_name character varying, income_level character varying, median_income numeric, msa_md_median_income numeric, tract_median_family_income numeric, ami_percentage numeric, is_lmi_eligible boolean, ffiec_data_year integer, tract_population integer, minority_population_pct numeric, owner_occupied_units integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Try exact match first
  RETURN QUERY
  SELECT 
    ct.tract_id,
    ct.state,
    ct.county,
    ct.tract_name,
    ct.income_level,
    ct.median_income,
    ct.msa_md_median_income,
    ct.tract_median_family_income,
    ct.ami_percentage,
    ct.is_lmi_eligible,
    ct.ffiec_data_year,
    ct.tract_population,
    ct.minority_population_pct,
    ct.owner_occupied_units
  FROM census_tracts ct
  WHERE ct.tract_id = input_tract_id
  LIMIT 1;
  
  -- If no exact match found, try flexible matching
  IF NOT FOUND THEN
    -- Clean the input and try different formatting approaches
    DECLARE
      clean_id text := regexp_replace(input_tract_id, '[^0-9]', '', 'g');
      state_part text;
      county_part text; 
      tract_part text;
    BEGIN
      -- Extract components if we have at least 11 digits
      IF length(clean_id) >= 11 THEN
        state_part := substring(clean_id, 1, 2);
        county_part := substring(clean_id, 3, 3);
        tract_part := substring(clean_id, 6);
        
        -- Try matching by components
        RETURN QUERY
        SELECT 
          ct.tract_id,
          ct.state,
          ct.county,
          ct.tract_name,
          ct.income_level,
          ct.median_income,
          ct.msa_md_median_income,
          ct.tract_median_family_income,
          ct.ami_percentage,
          ct.is_lmi_eligible,
          ct.ffiec_data_year,
          ct.tract_population,
          ct.minority_population_pct,
          ct.owner_occupied_units
        FROM census_tracts ct
        WHERE ct.state_code = state_part
          AND ct.county_code = county_part
          AND ct.tract_code = tract_part
        LIMIT 1;
      END IF;
    END;
  END IF;
END;
$function$;

-- Update trigger function
CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update auto generate invitation code function
CREATE OR REPLACE FUNCTION public.auto_generate_invitation_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    IF NEW.invitation_code IS NULL THEN
        NEW.invitation_code := generate_invitation_code();
    END IF;
    RETURN NEW;
END;
$function$;

-- Update communication templates function
CREATE OR REPLACE FUNCTION public.update_communication_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Check and enable RLS on any tables that might be missing it
-- First, let's check which tables don't have RLS enabled
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND NOT EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON c.relnamespace = n.oid 
            WHERE n.nspname = 'public' 
            AND c.relname = pg_tables.tablename 
            AND c.relrowsecurity = true
        )
        AND tablename NOT LIKE 'spatial_ref_sys'
        AND tablename NOT LIKE 'geography_columns'
        AND tablename NOT LIKE 'geometry_columns'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
        RAISE NOTICE 'Enabled RLS on table: %', r.tablename;
    END LOOP;
END $$;

-- Add default policies for system tables that need basic access
CREATE POLICY IF NOT EXISTS "Allow authenticated access to auth_rate_limits"
ON public.auth_rate_limits
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);