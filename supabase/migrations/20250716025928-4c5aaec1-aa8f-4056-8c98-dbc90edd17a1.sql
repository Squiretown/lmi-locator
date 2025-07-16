-- Drop ALL existing policies on user_profiles to fix infinite recursion
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for users to create their own profile" ON user_profiles;  
DROP POLICY IF EXISTS "Enable update for users to update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create simple, non-recursive RLS policies
CREATE POLICY "user_profiles_select_policy" 
ON user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_policy" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_policy" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);