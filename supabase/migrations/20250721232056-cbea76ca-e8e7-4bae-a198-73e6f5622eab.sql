
-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage system settings
CREATE POLICY "Admins can manage system settings" 
  ON public.system_settings 
  FOR ALL 
  USING (user_is_admin())
  WITH CHECK (user_is_admin());

-- Create policy for public settings to be readable by everyone
CREATE POLICY "Public settings are readable by everyone" 
  ON public.system_settings 
  FOR SELECT 
  USING (is_public = true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- Insert default settings
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
  ('site_name', 'LMI Property Search', 'The name of the website', true),
  ('site_description', 'Find LMI eligible properties and assistance programs', 'The description of the website', true),
  ('maintenance_mode', 'false', 'Whether the site is in maintenance mode', false),
  ('allow_registration', 'true', 'Whether new user registration is allowed', false),
  ('contact_email', 'info@lmicheck.com', 'Main contact email address', true),
  ('contact_phone', '(555) 123-4567', 'Main contact phone number', true),
  ('contact_address', 'Suffolk, NY', 'Business address', true),
  ('support_email', 'support@lmicheck.com', 'Support email address', true),
  ('business_hours', 'Monday - Friday: 9:00 AM - 5:00 PM EST', 'Business hours', true),
  ('max_file_size', '10', 'Maximum file size in MB', false),
  ('auto_backup', 'true', 'Whether automatic backups are enabled', false),
  ('session_timeout', '24', 'Session timeout in hours', false),
  ('api_rate_limit', '1000', 'API rate limit per hour', false),
  ('email_notifications', 'true', 'Whether email notifications are enabled', false)
ON CONFLICT (key) DO NOTHING;
