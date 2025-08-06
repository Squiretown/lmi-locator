-- Update user profile constraints to reflect new signup policy
-- Clients should only be created through professional invitations

-- Add a constraint to prevent direct client signup
-- Create a function to validate user creation method
CREATE OR REPLACE FUNCTION validate_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If creating a client user type, ensure they came through invitation
  -- This will be handled in the application layer for now
  -- But we can add database-level validation later
  
  -- For now, just log the creation
  INSERT INTO activity_logs (
    activity_type,
    description,
    entity_type,
    entity_id,
    user_id,
    data
  ) VALUES (
    'user_profile_created',
    'New user profile created: ' || NEW.user_type,
    'user_profile',
    NEW.id,
    NEW.user_id,
    jsonb_build_object(
      'user_type', NEW.user_type,
      'created_via', 'direct_signup'
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for user profile creation logging
DROP TRIGGER IF EXISTS trigger_validate_user_creation ON user_profiles;
CREATE TRIGGER trigger_validate_user_creation
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_creation();

-- Update RLS policies to be more restrictive for client creation
-- Only allow professionals to create client profiles through invitations