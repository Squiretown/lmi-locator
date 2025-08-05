-- Phase 1: Fix RLS and security issues
-- Enable RLS on any missing tables and fix function security

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is admin via metadata
  RETURN (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin');
END;
$$;

-- Create team_communications table for tracking team member communications
CREATE TABLE IF NOT EXISTS public.team_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL,
  team_member_email text,
  team_member_phone text,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  subject text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  delivered_at timestamp with time zone,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on team_communications
ALTER TABLE public.team_communications ENABLE ROW LEVEL SECURITY;

-- Create policies for team_communications
CREATE POLICY "Users can insert their own team communications" 
ON public.team_communications 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can view their own team communications" 
ON public.team_communications 
FOR SELECT 
USING (sender_id = auth.uid());

CREATE POLICY "Admins can view all team communications" 
ON public.team_communications 
FOR ALL 
USING (user_is_admin());

-- Create team communication templates table
CREATE TABLE IF NOT EXISTS public.team_communication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  subject text,
  content text NOT NULL,
  variables jsonb DEFAULT '{}',
  is_global boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on team communication templates
ALTER TABLE public.team_communication_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for team communication templates
CREATE POLICY "Everyone can view global team templates" 
ON public.team_communication_templates 
FOR SELECT 
USING (is_global = true);

CREATE POLICY "Admins can manage all team templates" 
ON public.team_communication_templates 
FOR ALL 
USING (user_is_admin())
WITH CHECK (user_is_admin());

-- Insert default team communication templates
INSERT INTO public.team_communication_templates (name, type, subject, content, variables, is_global) VALUES
('Team Introduction Email', 'email', 'Welcome to Our Team - {{client_name}}', 
'Hi {{team_member_name}},

I hope this email finds you well. I wanted to introduce you to a new client, {{client_name}}, who is looking for {{service_type}} assistance.

Client Details:
- Name: {{client_name}}
- Email: {{client_email}}
- Phone: {{client_phone}}
- Timeline: {{timeline}}

{{additional_notes}}

Please reach out to {{client_name}} at your earliest convenience. I believe you''ll be a great fit for their needs.

Best regards,
{{sender_name}}',
'{"team_member_name": "Team member''s name", "client_name": "Client''s full name", "service_type": "Type of service needed", "client_email": "Client email address", "client_phone": "Client phone number", "timeline": "Client timeline", "additional_notes": "Any additional notes", "sender_name": "Your name"}',
true),

('Quick Team Update SMS', 'sms', NULL,
'Hi {{team_member_name}}, new client {{client_name}} needs {{service_type}}. Contact: {{client_phone}}. Timeline: {{timeline}}. Thanks! - {{sender_name}}',
'{"team_member_name": "Team member''s name", "client_name": "Client''s name", "service_type": "Service type", "client_phone": "Client phone", "timeline": "Timeline", "sender_name": "Your name"}',
true),

('Client Referral Email', 'email', 'Client Referral - {{client_name}}',
'Dear {{team_member_name}},

I have a client referral for you. {{client_name}} is interested in {{service_type}} and I believe they would be a perfect fit for your expertise.

Client Information:
{{client_details}}

I''ve spoken highly of your services and {{client_name}} is looking forward to hearing from you.

Please contact them within the next 24-48 hours.

Best,
{{sender_name}}
{{sender_company}}',
'{"team_member_name": "Team member name", "client_name": "Client name", "service_type": "Type of service", "client_details": "Detailed client information", "sender_name": "Your name", "sender_company": "Your company"}',
true);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_team_template_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_team_communication_templates_timestamp
    BEFORE UPDATE ON public.team_communication_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_team_template_timestamp();