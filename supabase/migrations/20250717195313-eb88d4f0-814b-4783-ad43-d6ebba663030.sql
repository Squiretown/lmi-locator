-- Fix infinite recursion in user_profiles RLS policies by cleaning up overlapping policies

-- First, drop all the problematic and duplicate policies on user_profiles
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to view their own profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_can_delete_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admin_can_read_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admin_can_update_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admin_full_access" ON user_profiles;
DROP POLICY IF EXISTS "user_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_read_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;

-- Create clean, non-recursive policies for user_profiles
CREATE POLICY "users_can_read_own_profile" ON user_profiles
FOR SELECT TO public
USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles  
FOR UPDATE TO public
USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_profile" ON user_profiles
FOR INSERT TO public
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_profile" ON user_profiles
FOR DELETE TO public
USING (auth.uid() = user_id);

-- Admin policies that don't cause recursion
CREATE POLICY "admins_can_manage_all_profiles" ON user_profiles
FOR ALL TO public
USING (get_current_user_type() = 'admin'::text)
WITH CHECK (get_current_user_type() = 'admin'::text);