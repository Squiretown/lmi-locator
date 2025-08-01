-- Fix RLS policies and create secure admin role system

-- First, let's ensure all tables have RLS enabled (fixing the linter warning)
-- Check and enable RLS on any tables that might be missing it

-- Enable RLS on tables that might not have it enabled
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a secure function to check admin status (fixing security issue)
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user exists and has admin role in user metadata
  -- This is more secure than exposing the check in RLS policies directly
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data->>'user_type' = 'admin' OR user_metadata->>'user_type' = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a function to get user type securely
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'user_type', user_metadata->>'user_type', 'client')
    FROM auth.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create comprehensive security audit function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_target_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_id,
    target_user_id,
    details,
    ip_address,
    user_agent,
    success
  ) VALUES (
    p_event_type,
    COALESCE(p_user_id, auth.uid()),
    p_target_user_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_success
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate password strength server-side
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS JSONB AS $$
DECLARE
  errors TEXT[] := '{}';
  result JSONB;
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for uppercase letter
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letter
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for digit
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special character
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  result := jsonb_build_object(
    'is_valid', array_length(errors, 1) IS NULL,
    'errors', to_jsonb(errors)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER IMMUTABLE;