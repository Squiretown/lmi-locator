-- Create theme_settings table for storing custom color configurations
CREATE TABLE public.theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  light_value TEXT NOT NULL,
  dark_value TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'colors',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create theme_presets table for storing predefined and custom theme presets
CREATE TABLE public.theme_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  colors JSONB NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_presets ENABLE ROW LEVEL SECURITY;

-- Create policies for theme_settings
CREATE POLICY "Admins can manage theme settings" 
ON public.theme_settings 
FOR ALL 
USING (is_admin_user_safe());

CREATE POLICY "Everyone can view theme settings" 
ON public.theme_settings 
FOR SELECT 
USING (true);

-- Create policies for theme_presets
CREATE POLICY "Admins can manage theme presets" 
ON public.theme_presets 
FOR ALL 
USING (is_admin_user_safe());

CREATE POLICY "Everyone can view theme presets" 
ON public.theme_presets 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_theme_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_theme_settings_updated_at();

CREATE TRIGGER update_theme_presets_updated_at
  BEFORE UPDATE ON public.theme_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_theme_settings_updated_at();

-- Insert default theme settings
INSERT INTO public.theme_settings (setting_key, light_value, dark_value, description, category) VALUES
('primary', '222.2 84% 4.9%', '210 40% 98%', 'Primary brand color', 'colors'),
('primary-foreground', '210 40% 98%', '222.2 84% 4.9%', 'Primary foreground color', 'colors'),
('secondary', '210 40% 96%', '222.2 84% 4.9%', 'Secondary color', 'colors'),
('secondary-foreground', '222.2 84% 4.9%', '210 40% 98%', 'Secondary foreground color', 'colors'),
('accent', '210 40% 96%', '217.2 32.6% 17.5%', 'Accent color', 'colors'),
('accent-foreground', '222.2 84% 4.9%', '210 40% 98%', 'Accent foreground color', 'colors'),
('muted', '210 40% 96%', '217.2 32.6% 17.5%', 'Muted background color', 'colors'),
('muted-foreground', '215.4 16.3% 46.9%', '215 20.2% 65.1%', 'Muted foreground color', 'colors'),
('background', '0 0% 100%', '222.2 84% 4.9%', 'Background color', 'colors'),
('foreground', '222.2 84% 4.9%', '210 40% 98%', 'Foreground color', 'colors'),
('border', '214.3 31.8% 91.4%', '217.2 32.6% 17.5%', 'Border color', 'colors'),
('input', '214.3 31.8% 91.4%', '217.2 32.6% 17.5%', 'Input border color', 'colors'),
('ring', '222.2 84% 4.9%', '212.7 26.8% 83.9%', 'Focus ring color', 'colors'),
('destructive', '0 84.2% 60.2%', '0 62.8% 30.6%', 'Destructive color', 'colors'),
('destructive-foreground', '210 40% 98%', '210 40% 98%', 'Destructive foreground color', 'colors');

-- Insert default theme presets
INSERT INTO public.theme_presets (name, description, colors, is_default) VALUES
('Default Theme', 'The default application theme', '{"primary": "222.2 84% 4.9%", "secondary": "210 40% 96%", "accent": "210 40% 96%"}', true),
('Ocean Blue', 'Cool blue ocean-inspired theme', '{"primary": "213 94% 68%", "secondary": "213 27% 84%", "accent": "213 100% 96%"}', true),
('Forest Green', 'Natural green forest theme', '{"primary": "142 76% 36%", "secondary": "138 76% 97%", "accent": "138 76% 97%"}', true),
('Sunset Orange', 'Warm orange sunset theme', '{"primary": "25 95% 53%", "secondary": "25 100% 97%", "accent": "25 100% 97%"}', true),
('Royal Purple', 'Elegant purple royal theme', '{"primary": "262 83% 58%", "secondary": "270 100% 98%", "accent": "270 100% 98%"}', true);