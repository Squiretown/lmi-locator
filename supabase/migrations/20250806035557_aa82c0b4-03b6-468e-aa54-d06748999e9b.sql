-- Fix security warnings from the linter

-- Fix function search path by setting it explicitly
CREATE OR REPLACE FUNCTION validate_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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