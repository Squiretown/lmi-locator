-- Add new client statuses and activity tracking
ALTER TABLE client_profiles 
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES auth.users(id);

-- Create client activity logs table
CREATE TABLE IF NOT EXISTS client_activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL,
    activity_type TEXT NOT NULL, -- 'status_change', 'communication_sent', 'note_added', etc.
    activity_data JSONB,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create communication templates table
CREATE TABLE IF NOT EXISTS communication_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'welcome', 'follow_up', 'status_change', 'appointment_reminder'
    type TEXT NOT NULL, -- 'email', 'sms'
    professional_type TEXT NOT NULL, -- 'realtor', 'mortgage_professional', 'both'
    subject TEXT, -- for emails
    content TEXT NOT NULL,
    variables JSONB, -- available template variables
    is_global BOOLEAN NOT NULL DEFAULT false, -- admin templates
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client communications table
CREATE TABLE IF NOT EXISTS client_communications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL,
    template_id UUID REFERENCES communication_templates(id),
    type TEXT NOT NULL, -- 'email', 'sms'
    recipient TEXT NOT NULL, -- email or phone number
    subject TEXT, -- for emails
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Enable RLS on new tables
ALTER TABLE client_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_activity_logs
CREATE POLICY "Professionals can view their client activity logs"
    ON client_activity_logs FOR SELECT
    USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert their client activity logs"
    ON client_activity_logs FOR INSERT
    WITH CHECK (professional_id = auth.uid());

-- RLS policies for communication_templates
CREATE POLICY "Professionals can view global and their own templates"
    ON communication_templates FOR SELECT
    USING (is_global = true OR created_by = auth.uid());

CREATE POLICY "Professionals can create their own templates"
    ON communication_templates FOR INSERT
    WITH CHECK (created_by = auth.uid() AND is_global = false);

CREATE POLICY "Professionals can update their own templates"
    ON communication_templates FOR UPDATE
    USING (created_by = auth.uid() AND is_global = false);

CREATE POLICY "Admins can manage all templates"
    ON communication_templates FOR ALL
    USING (user_is_admin());

-- RLS policies for client_communications
CREATE POLICY "Professionals can view their client communications"
    ON client_communications FOR SELECT
    USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert their client communications"
    ON client_communications FOR INSERT
    WITH CHECK (professional_id = auth.uid());

-- Insert default templates
INSERT INTO communication_templates (name, category, type, professional_type, subject, content, variables, is_global, created_by) VALUES
('Welcome Email - Realtor', 'welcome', 'email', 'realtor', 'Welcome to {{professional_name}} Real Estate Services', 'Dear {{client_name}},\n\nWelcome! I''m excited to help you with your real estate needs. I''ll be in touch soon to discuss your requirements.\n\nBest regards,\n{{professional_name}}\n{{professional_company}}', '{"client_name": "Client''s full name", "professional_name": "Professional''s name", "professional_company": "Company name"}', true, NULL),
('Welcome Email - Mortgage', 'welcome', 'email', 'mortgage_professional', 'Welcome to {{professional_name}} Mortgage Services', 'Dear {{client_name}},\n\nThank you for choosing our mortgage services. I''ll guide you through the entire process to make your homeownership dreams a reality.\n\nBest regards,\n{{professional_name}}\n{{professional_company}}', '{"client_name": "Client''s full name", "professional_name": "Professional''s name", "professional_company": "Company name"}', true, NULL),
('Follow-up SMS', 'follow_up', 'sms', 'both', NULL, 'Hi {{client_name}}, this is {{professional_name}}. Just checking in on your progress. Please call me if you have any questions!', '{"client_name": "Client''s first name", "professional_name": "Professional''s name"}', true, NULL),
('Status Change Email', 'status_change', 'email', 'both', 'Status Update for Your Account', 'Dear {{client_name}},\n\nYour account status has been updated to: {{new_status}}\n\n{{status_reason}}\n\nIf you have any questions, please don''t hesitate to contact me.\n\nBest regards,\n{{professional_name}}', '{"client_name": "Client''s full name", "professional_name": "Professional''s name", "new_status": "New status", "status_reason": "Reason for status change"}', true, NULL);

-- Add trigger for updated_at on communication_templates
CREATE OR REPLACE FUNCTION update_communication_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_communication_templates_updated_at
    BEFORE UPDATE ON communication_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_communication_templates_updated_at();