import { supabase } from '@/integrations/supabase/client';

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  is_public: boolean;
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  autoBackup: boolean;
  sessionTimeout: string;
  maxFileSize: string;
  apiRateLimit: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  supportEmail: string;
  businessHours: string;
}

export async function loadSystemSettings(): Promise<{
  general: GeneralSettings;
  contact: ContactInfo;
}> {
  const { data: settings, error } = await supabase
    .from('system_settings')
    .select('key, value');

  if (error) {
    throw new Error(`Failed to load settings: ${error.message}`);
  }

  // Convert array to object for easier access
  const settingsMap = settings?.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>) || {};

  // Transform to expected format
  const general: GeneralSettings = {
    siteName: settingsMap.site_name || 'LMI Property Search',
    siteDescription: settingsMap.site_description || 'Find LMI eligible properties and assistance programs',
    maintenanceMode: settingsMap.maintenance_mode === 'true',
    allowRegistration: settingsMap.allow_registration === 'true',
    emailNotifications: settingsMap.email_notifications === 'true',
    autoBackup: settingsMap.auto_backup === 'true',
    sessionTimeout: settingsMap.session_timeout || '24',
    maxFileSize: settingsMap.max_file_size || '10',
    apiRateLimit: settingsMap.api_rate_limit || '1000'
  };

  const contact: ContactInfo = {
    email: settingsMap.contact_email || 'info@lmicheck.com',
    phone: settingsMap.contact_phone || '(555) 123-4567',
    address: settingsMap.contact_address || 'Suffolk, NY',
    supportEmail: settingsMap.support_email || 'support@lmicheck.com',
    businessHours: settingsMap.business_hours || 'Monday - Friday: 9:00 AM - 5:00 PM EST'
  };

  return { general, contact };
}

export async function saveSystemSettings(
  general: GeneralSettings,
  contact: ContactInfo
): Promise<void> {
  // Validate user session first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('Authentication required. Please log in again.');
  }

  // Check if user has active session
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error('No active session. Please log in again.');
  }

  const updates = [
    { key: 'site_name', value: general.siteName },
    { key: 'site_description', value: general.siteDescription },
    { key: 'maintenance_mode', value: general.maintenanceMode.toString() },
    { key: 'allow_registration', value: general.allowRegistration.toString() },
    { key: 'email_notifications', value: general.emailNotifications.toString() },
    { key: 'auto_backup', value: general.autoBackup.toString() },
    { key: 'session_timeout', value: general.sessionTimeout },
    { key: 'max_file_size', value: general.maxFileSize },
    { key: 'api_rate_limit', value: general.apiRateLimit },
    { key: 'contact_email', value: contact.email },
    { key: 'contact_phone', value: contact.phone },
    { key: 'contact_address', value: contact.address },
    { key: 'support_email', value: contact.supportEmail },
    { key: 'business_hours', value: contact.businessHours }
  ];

  const errors: string[] = [];

  for (const update of updates) {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: update.value
          // Remove manual updated_at - let the trigger handle it
        })
        .eq('key', update.key);

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error);
        errors.push(`${update.key}: ${error.message}`);
      }
    } catch (err) {
      console.error(`Unexpected error updating ${update.key}:`, err);
      errors.push(`${update.key}: Unexpected error occurred`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to update settings:\n${errors.join('\n')}`);
  }
}