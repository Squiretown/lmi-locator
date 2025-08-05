-- Fix remaining CASCADE constraints that were identified
ALTER TABLE system_settings 
DROP CONSTRAINT IF EXISTS system_settings_updated_by_fkey;

ALTER TABLE system_settings 
ADD CONSTRAINT system_settings_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

ALTER TABLE activity_logs 
ADD CONSTRAINT activity_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on any tables that might be missing it
-- Check which tables in public schema don't have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- Enable RLS on system_settings if it exists and doesn't have RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_settings') THEN
        ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
        
        -- Add admin-only policy for system_settings
        CREATE POLICY "Admin access to system settings" 
        ON public.system_settings 
        FOR ALL 
        USING (user_is_admin())
        WITH CHECK (user_is_admin());
    END IF;
END$$;

-- Enable RLS on program_eligibility_checks if it exists and doesn't have RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'program_eligibility_checks') THEN
        ALTER TABLE public.program_eligibility_checks ENABLE ROW LEVEL SECURITY;
        
        -- Add user-specific policy for program_eligibility_checks
        CREATE POLICY "Users can view their own eligibility checks" 
        ON public.program_eligibility_checks 
        FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own eligibility checks" 
        ON public.program_eligibility_checks 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END$$;