-- Create the missing security audit log table and fix RLS issues
-- Only apply security improvements without modifying system tables

-- Create security audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for security audit log
CREATE POLICY "Admins can view all security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (user_is_admin());

CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Set proper search_path for all functions to fix linter warnings
ALTER FUNCTION public.user_is_admin() SET search_path = public, auth;
ALTER FUNCTION public.get_current_user_type() SET search_path = public, auth;
ALTER FUNCTION public.log_security_event(TEXT, UUID, UUID, JSONB, TEXT, TEXT, BOOLEAN) SET search_path = public, auth;
ALTER FUNCTION public.validate_password_strength(TEXT) SET search_path = public;

-- Add security monitoring trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when user roles are changed
  IF TG_TABLE_NAME = 'user_profiles' AND TG_OP = 'UPDATE' THEN
    IF OLD.user_type IS DISTINCT FROM NEW.user_type THEN
      PERFORM log_security_event(
        'user_type_changed',
        auth.uid(),
        NEW.user_id,
        jsonb_build_object(
          'old_type', OLD.user_type,
          'new_type', NEW.user_type,
          'table', TG_TABLE_NAME
        )
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to user_profiles if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    DROP TRIGGER IF EXISTS audit_user_profiles_changes ON public.user_profiles;
    CREATE TRIGGER audit_user_profiles_changes
      AFTER UPDATE ON public.user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.audit_sensitive_operations();
  END IF;
END $$;