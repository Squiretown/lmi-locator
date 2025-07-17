-- Step 1: Drop ALL existing policies on user_profiles to eliminate infinite recursion
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for users to create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users to update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Step 2: Create clean, non-recursive RLS policies
CREATE POLICY "user_profiles_read_own" 
ON user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete_own" 
ON user_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Step 3: Admin policies using the safe user_is_admin() function
CREATE POLICY "admin_can_read_all_profiles" 
ON user_profiles FOR SELECT 
USING (user_is_admin());

CREATE POLICY "admin_can_update_all_profiles" 
ON user_profiles FOR UPDATE 
USING (user_is_admin());

CREATE POLICY "admin_can_delete_all_profiles" 
ON user_profiles FOR DELETE 
USING (user_is_admin());

-- Step 4: Create admin error logging table
CREATE TABLE IF NOT EXISTS admin_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB,
  operation TEXT NOT NULL,
  target_user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable RLS on admin_error_logs
ALTER TABLE admin_error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_error_logs
CREATE POLICY "admin_error_logs_admin_access" 
ON admin_error_logs FOR ALL 
USING (user_is_admin());

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_error_logs_admin_user_id ON admin_error_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_error_logs_created_at ON admin_error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_error_logs_resolved ON admin_error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_admin_error_logs_error_type ON admin_error_logs(error_type);