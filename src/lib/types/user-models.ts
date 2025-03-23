
// User-related Database Models
export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
  is_admin: boolean;
  verification_status?: string;
  verification_method?: string;
  verification_date?: string;
  failed_login_attempts?: number;
  last_ip_address?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  phone?: string;
  company?: string;
  job_title?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bio?: string;
  profile_image?: string;
  notification_preferences: {
    email: boolean;
    in_app: boolean;
    sms: boolean;
  };
  user_type?: string;
  company_name?: string;
  license_number?: string;
  license_verified?: boolean;
  professional_bio?: string;
  website?: string;
  subscription_tier?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
}

// Extended UserProfile interface
export interface ExtendedUserProfile extends UserProfile {
  user_type?: string;
  company_name?: string;
  company_address?: string;
  company_website?: string;
  license_number?: string;
  subscription_tier?: string;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
}

export interface NotificationPreference {
  preference_id: string;
  user_id: string;
  notification_type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  frequency: string;
}

export interface Client {
  client_id: string;
  professional_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  professional_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: string;
  notes?: string;
  income?: number;
  household_size?: number;
  first_time_buyer?: boolean;
  military_status?: string;
  timeline?: string;
  saved_properties?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
