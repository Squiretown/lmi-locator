
-- Add new columns to notifications table for enhanced admin messaging
ALTER TABLE public.notifications 
ADD COLUMN priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN scheduled_for timestamp with time zone,
ADD COLUMN template_id uuid,
ADD COLUMN bulk_message_id uuid;

-- Create admin message templates table
CREATE TABLE public.admin_message_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  notification_type text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_message_templates
ALTER TABLE public.admin_message_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_message_templates
CREATE POLICY "Admins can manage message templates" 
  ON public.admin_message_templates 
  FOR ALL 
  USING (user_is_admin());

-- Create function to update template timestamps
CREATE OR REPLACE FUNCTION public.update_admin_message_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create trigger for updating timestamps
CREATE TRIGGER update_admin_message_templates_updated_at
    BEFORE UPDATE ON public.admin_message_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_message_templates_updated_at();

-- Insert default billing templates
INSERT INTO public.admin_message_templates (name, category, subject, content, notification_type, priority, variables) VALUES
('Payment Due Reminder', 'billing', 'Payment Due Notice', 'Your payment of {{amount}} is due on {{due_date}}. Please make your payment to avoid service interruption.', 'payment_due', 'high', '["amount", "due_date"]'::jsonb),
('Account Status Update', 'account', 'Account Status Change', 'Your account status has been updated to: {{status}}. {{additional_info}}', 'account_status', 'normal', '["status", "additional_info"]'::jsonb),
('Billing Issue', 'billing', 'Billing Issue Requires Attention', 'There is an issue with your billing that requires your immediate attention: {{issue_description}}', 'billing', 'urgent', '["issue_description"]'::jsonb),
('System Maintenance', 'system', 'Scheduled System Maintenance', 'We will be performing system maintenance on {{maintenance_date}} from {{start_time}} to {{end_time}}. {{additional_details}}', 'system_maintenance', 'normal', '["maintenance_date", "start_time", "end_time", "additional_details"]'::jsonb);
