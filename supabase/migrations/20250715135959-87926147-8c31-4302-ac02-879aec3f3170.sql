-- Reset theme settings to match default CSS values and add enable flag
-- First, create a system setting to control whether custom themes are enabled
INSERT INTO system_settings (key, value, description, is_public) 
VALUES ('custom_themes_enabled', 'false', 'Enable custom theme management system', true)
ON CONFLICT (key) DO UPDATE SET value = 'false';

-- Reset theme_settings to proper default values that match index.css
UPDATE theme_settings SET 
  light_value = '210 33% 99%',
  dark_value = '210 30% 8%'
WHERE setting_key = 'background';

UPDATE theme_settings SET 
  light_value = '210 25% 10%',
  dark_value = '0 0% 95%'
WHERE setting_key = 'foreground';

UPDATE theme_settings SET 
  light_value = '0 0% 100%',
  dark_value = '210 25% 12%'
WHERE setting_key = 'card';

UPDATE theme_settings SET 
  light_value = '210 25% 10%',
  dark_value = '0 0% 95%'
WHERE setting_key = 'card-foreground';

UPDATE theme_settings SET 
  light_value = '220 100% 50%',
  dark_value = '220 100% 60%'
WHERE setting_key = 'primary';

UPDATE theme_settings SET 
  light_value = '0 0% 100%',
  dark_value = '0 0% 98%'
WHERE setting_key = 'primary-foreground';

UPDATE theme_settings SET 
  light_value = '220 15% 95%',
  dark_value = '210 25% 16%'
WHERE setting_key = 'secondary';

UPDATE theme_settings SET 
  light_value = '220 25% 10%',
  dark_value = '0 0% 95%'
WHERE setting_key = 'secondary-foreground';

UPDATE theme_settings SET 
  light_value = '220 15% 92%',
  dark_value = '210 25% 16%'
WHERE setting_key = 'muted';

UPDATE theme_settings SET 
  light_value = '220 10% 50%',
  dark_value = '210 20% 60%'
WHERE setting_key = 'muted-foreground';

UPDATE theme_settings SET 
  light_value = '220 15% 92%',
  dark_value = '210 25% 16%'
WHERE setting_key = 'accent';

UPDATE theme_settings SET 
  light_value = '220 25% 10%',
  dark_value = '0 0% 95%'
WHERE setting_key = 'accent-foreground';

UPDATE theme_settings SET 
  light_value = '0 85% 60%',
  dark_value = '0 70% 50%'
WHERE setting_key = 'destructive';

UPDATE theme_settings SET 
  light_value = '210 40% 98%',
  dark_value = '0 0% 95%'
WHERE setting_key = 'destructive-foreground';

UPDATE theme_settings SET 
  light_value = '220 15% 90%',
  dark_value = '210 25% 20%'
WHERE setting_key = 'border';

UPDATE theme_settings SET 
  light_value = '220 15% 90%',
  dark_value = '210 25% 20%'
WHERE setting_key = 'input';

UPDATE theme_settings SET 
  light_value = '220 100% 50%',
  dark_value = '220 100% 60%'
WHERE setting_key = 'ring';