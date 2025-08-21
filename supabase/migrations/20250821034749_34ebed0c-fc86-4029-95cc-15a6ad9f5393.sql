-- Fix security issues from the linter

-- Fix search path mutable warnings for new functions
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(10) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(10) := '';
  i INTEGER;
  attempts INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM user_invitations WHERE invite_code = result) THEN
      RETURN result;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique invite code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION set_default_invite_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE user_invitations 
  SET status = 'expired'
  WHERE status IN ('pending', 'sent') 
    AND expires_at < NOW();
    
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

CREATE OR REPLACE FUNCTION log_invitation_action(
  p_invitation_id UUID,
  p_action VARCHAR(50),
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO invitation_audit_log (
    invitation_id,
    action,
    details,
    performed_by,
    ip_address,
    user_agent
  ) VALUES (
    p_invitation_id,
    p_action,
    p_details,
    auth.uid(),
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;