-- Add invitation codes and SMS capabilities to contacts_invited table
ALTER TABLE public.contacts_invited 
ADD COLUMN invitation_code TEXT UNIQUE,
ADD COLUMN sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN invitation_type TEXT DEFAULT 'email' CHECK (invitation_type IN ('email', 'sms', 'both')),
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days');

-- Create index for invitation codes
CREATE INDEX idx_contacts_invited_code ON public.contacts_invited(invitation_code);

-- Create function to generate unique invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code() 
RETURNS TEXT 
LANGUAGE plpgsql 
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate 8-character alphanumeric code
        code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
        -- Remove ambiguous characters
        code := replace(replace(replace(replace(code, '0', 'Z'), '1', 'Y'), 'O', 'X'), 'I', 'W');
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.contacts_invited WHERE invitation_code = code) INTO exists_check;
        
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Add trigger to auto-generate invitation codes
CREATE OR REPLACE FUNCTION auto_generate_invitation_code()
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
BEGIN
    IF NEW.invitation_code IS NULL THEN
        NEW.invitation_code := generate_invitation_code();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_invitation_code
    BEFORE INSERT ON public.contacts_invited
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_invitation_code();

-- Create client_invitations table for better tracking
CREATE TABLE public.client_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL,
    client_email TEXT NOT NULL,
    client_name TEXT,
    client_phone TEXT,
    invitation_code TEXT UNIQUE NOT NULL DEFAULT generate_invitation_code(),
    invitation_type TEXT NOT NULL DEFAULT 'email' CHECK (invitation_type IN ('email', 'sms', 'both')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'revoked')),
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    client_id UUID REFERENCES public.client_profiles(id),
    template_type TEXT DEFAULT 'default',
    custom_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on client_invitations
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_invitations
CREATE POLICY "Professionals can manage their client invitations"
    ON public.client_invitations
    FOR ALL
    USING (professional_id = auth.uid());

-- Add indexes
CREATE INDEX idx_client_invitations_professional ON public.client_invitations(professional_id);
CREATE INDEX idx_client_invitations_code ON public.client_invitations(invitation_code);
CREATE INDEX idx_client_invitations_status ON public.client_invitations(status);
CREATE INDEX idx_client_invitations_expires ON public.client_invitations(expires_at);

-- Add updated_at trigger
CREATE TRIGGER update_client_invitations_updated_at
    BEFORE UPDATE ON public.client_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp_column();