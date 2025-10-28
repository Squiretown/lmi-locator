-- Remove admin user: Shawn Steinmuller (info@squiretown.co)
-- User ID: 41fb0ff7-8888-4047-be34-8e7409b3b2ac

-- Step 1: Delete any professional records for this user
DELETE FROM professionals 
WHERE user_id = '41fb0ff7-8888-4047-be34-8e7409b3b2ac';

-- Step 2: Delete any professional team relationships
DELETE FROM professional_teams 
WHERE mortgage_professional_id IN (
  SELECT id FROM professionals WHERE user_id = '41fb0ff7-8888-4047-be34-8e7409b3b2ac'
)
OR realtor_id IN (
  SELECT id FROM professionals WHERE user_id = '41fb0ff7-8888-4047-be34-8e7409b3b2ac'
);

-- Step 3: Nullify theme_settings references (preserve settings, just remove user reference)
UPDATE theme_settings 
SET updated_by = NULL 
WHERE updated_by = '41fb0ff7-8888-4047-be34-8e7409b3b2ac';

-- Step 4: Delete user profile
DELETE FROM user_profiles 
WHERE user_id = '41fb0ff7-8888-4047-be34-8e7409b3b2ac';

-- Step 5: Delete the auth user (this will cascade to other tables with ON DELETE CASCADE)
DELETE FROM auth.users 
WHERE id = '41fb0ff7-8888-4047-be34-8e7409b3b2ac';