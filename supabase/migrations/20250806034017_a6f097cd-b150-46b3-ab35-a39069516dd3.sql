-- Fix user_profiles default user_type and ensure all role values are supported
-- Update the default value from 'standard' to 'client' for consistency
ALTER TABLE user_profiles ALTER COLUMN user_type SET DEFAULT 'client';

-- Update any existing 'standard' user_type values to 'client'
UPDATE user_profiles SET user_type = 'client' WHERE user_type = 'standard';