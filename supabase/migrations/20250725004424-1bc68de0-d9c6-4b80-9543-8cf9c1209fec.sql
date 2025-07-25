-- Fix security issues identified by the linter

-- Fix function search path issues for existing functions
CREATE OR REPLACE FUNCTION public.generate_invitation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate 8-character alphanumeric code
        code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
        -- Remove ambiguous characters
        code := replace(replace(replace(replace(code, '0', 'Z'), '1', 'Y'), 'O', 'X'), 'I', 'W');
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.contacts_invited WHERE invitation_code = code) INTO exists_check;
        
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_ffiec_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Enable RLS on tables that don't have it
ALTER TABLE public.assistance_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types_eligible ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_eligibility_checks ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for assistance_programs
CREATE POLICY "Public read access to assistance programs" 
ON public.assistance_programs FOR SELECT 
USING (true);

CREATE POLICY "Admin write access to assistance programs" 
ON public.assistance_programs FOR ALL 
USING (user_is_admin())
WITH CHECK (user_is_admin());

-- Add missing RLS policies for property_types_eligible (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_types_eligible') THEN
        EXECUTE 'CREATE POLICY "Public read access to property types eligible" ON public.property_types_eligible FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Admin write access to property types eligible" ON public.property_types_eligible FOR ALL USING (user_is_admin()) WITH CHECK (user_is_admin())';
    END IF;
END
$$;

-- Add missing RLS policies for program_locations (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'program_locations') THEN
        EXECUTE 'CREATE POLICY "Public read access to program locations" ON public.program_locations FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Admin write access to program locations" ON public.program_locations FOR ALL USING (user_is_admin()) WITH CHECK (user_is_admin())';
    END IF;
END
$$;

-- Add missing RLS policies for program_eligibility_checks (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'program_eligibility_checks') THEN
        EXECUTE 'CREATE POLICY "Users can view their own eligibility checks" ON public.program_eligibility_checks FOR SELECT USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can insert their own eligibility checks" ON public.program_eligibility_checks FOR INSERT WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Admin access to all eligibility checks" ON public.program_eligibility_checks FOR ALL USING (user_is_admin()) WITH CHECK (user_is_admin())';
    END IF;
END
$$;