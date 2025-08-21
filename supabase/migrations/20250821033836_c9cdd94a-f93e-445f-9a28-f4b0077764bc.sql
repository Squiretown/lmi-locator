-- Complete Client Invite System Overhaul - Phase 1: Unified Database Schema

-- Create new unified invitation table
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  invite_token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invite_code VARCHAR(10) UNIQUE NOT NULL,
  
  -- Who sent the invite
  invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by_name VARCHAR(255),
  
  -- Invite type and status
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'realtor', 'mortgage_professional')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled')),
  
  -- Basic info (common for both types)
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  
  -- Client-specific fields (NULL for professionals)
  property_interest VARCHAR(50) CHECK (property_interest IN ('buying', 'selling', 'refinancing') OR property_interest IS NULL),
  estimated_budget INTEGER,
  preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'text')),
  
  -- Professional-specific fields (NULL for clients)
  professional_type VARCHAR(30) CHECK (professional_type IN ('realtor', 'mortgage_broker', 'lender') OR professional_type IS NULL),
  license_number VARCHAR(50),
  license_state VARCHAR(2),
  company_name VARCHAR(255),
  years_experience INTEGER,
  service_areas JSONB,
  specializations JSONB,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Communication preferences
  send_via VARCHAR(20) DEFAULT 'email' CHECK (send_via IN ('email', 'sms', 'both')),
  custom_message TEXT,
  
  -- Metadata and tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  last_reminder_sent TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  
  -- Data integrity constraints
  CONSTRAINT unique_pending_invitation UNIQUE(email, user_type, status) DEFERRABLE INITIALLY DEFERRED,
  
  CONSTRAINT client_fields_check 
    CHECK (
      (user_type = 'client' AND professional_type IS NULL AND license_number IS NULL AND license_state IS NULL AND company_name IS NULL AND years_experience IS NULL AND service_areas IS NULL AND specializations IS NULL) OR
      (user_type != 'client')
    ),
    
  CONSTRAINT professional_fields_check
    CHECK (
      (user_type IN ('realtor', 'mortgage_professional') AND professional_type IS NOT NULL) OR
      (user_type = 'client' AND property_interest IS NOT NULL)
    )
);

-- Function to generate readable invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(10) AS $$
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
$$ LANGUAGE plpgsql;

-- Set default invite code using trigger
CREATE OR REPLACE FUNCTION set_default_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invite_code
  BEFORE INSERT ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION set_default_invite_code();

-- Function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- Indexes for performance and tracking
CREATE INDEX idx_user_invitations_token ON user_invitations(invite_token);
CREATE INDEX idx_user_invitations_code ON user_invitations(invite_code);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);
CREATE INDEX idx_user_invitations_type ON user_invitations(user_type);
CREATE INDEX idx_user_invitations_invited_by ON user_invitations(invited_by_user_id);
CREATE INDEX idx_user_invitations_expires ON user_invitations(expires_at);
CREATE INDEX idx_user_invitations_created ON user_invitations(created_at);

-- RLS Policies
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they created
CREATE POLICY "Users can view their sent invitations" 
  ON user_invitations FOR SELECT 
  USING (invited_by_user_id = auth.uid());

-- Users can create new invitations
CREATE POLICY "Users can create invitations" 
  ON user_invitations FOR INSERT 
  WITH CHECK (invited_by_user_id = auth.uid());

-- Users can update their own invitations (for resending, etc)
CREATE POLICY "Users can update their invitations" 
  ON user_invitations FOR UPDATE 
  USING (invited_by_user_id = auth.uid());

-- Users can delete/revoke their invitations
CREATE POLICY "Users can delete their invitations" 
  ON user_invitations FOR DELETE 
  USING (invited_by_user_id = auth.uid());

-- Public access for accepting invitations (by token)
CREATE POLICY "Public can read invitations by token for acceptance" 
  ON user_invitations FOR SELECT 
  USING (invite_token IS NOT NULL);

-- Create audit log table for tracking invitation events
CREATE TABLE invitation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES user_invitations(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}',
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_invitation_audit_invitation ON invitation_audit_log(invitation_id);
CREATE INDEX idx_invitation_audit_action ON invitation_audit_log(action);
CREATE INDEX idx_invitation_audit_performed_by ON invitation_audit_log(performed_by);
CREATE INDEX idx_invitation_audit_performed_at ON invitation_audit_log(performed_at);

-- RLS for audit log
ALTER TABLE invitation_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their invitations"
  ON invitation_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_invitations 
      WHERE user_invitations.id = invitation_audit_log.invitation_id 
      AND user_invitations.invited_by_user_id = auth.uid()
    )
  );

-- Function to log invitation actions
CREATE OR REPLACE FUNCTION log_invitation_action(
  p_invitation_id UUID,
  p_action VARCHAR(50),
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;