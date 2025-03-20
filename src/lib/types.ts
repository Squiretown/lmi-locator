
// API Response Types
export interface CheckLmiStatusResponse {
  is_approved: boolean;
  address: string;
  approval_message: string;
}

// Database Models
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
}

export interface Realtor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  brokerage?: string;
  license_number?: string;
  website?: string;
  bio?: string;
  photo_url?: string;
  social_media?: Record<string, string>;
  created_at: string;
  last_updated: string;
  is_flagged: boolean;
  notes?: string;
}

export interface Property {
  id: string;
  mls_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  property_type?: string;
  year_built?: number;
  description?: string;
  status?: string;
  days_on_market?: number;
  listing_date?: string;
  closing_date?: string;
  lat?: number;
  lon?: number;
  photos_url?: string[];
  virtual_tour_url?: string;
  is_lmi_eligible: boolean;
  lmi_data?: Record<string, any>;
  census_tract?: string;
  median_income?: number;
  ami_percentage?: number;
  income_category?: string;
  realtor_id?: string;
  created_at: string;
  last_updated: string;
}

export interface Alert {
  id: string;
  user_id: string;
  name: string;
  criteria: Record<string, any>;
  frequency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_sent_at?: string;
}

export interface PropertyMatch {
  id: string;
  alert_id: string;
  property_id?: string;
  mls_number: string;
  address?: string;
  price?: number;
  created_at: string;
  is_notified: boolean;
  notification_date?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  alert_id?: string;
  message: string;
  data?: Record<string, any>;
  notification_type: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  notes?: string;
  created_at: string;
  folder: string;
  is_favorite: boolean;
}

export interface SearchHistory {
  id: string;
  user_id?: string;
  address: string;
  search_query?: string;
  search_params?: Record<string, any>;
  result_count?: number;
  lmi_result_count?: number;
  tract_id?: string;
  result: Record<string, any>;
  is_eligible?: boolean;
  income_category?: string;
  searched_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ApiUsage {
  id: string;
  api_name: string;
  count: number;
  date: string;
  status?: string;
  response_time?: number;
}

export interface AmiThreshold {
  id: string;
  county: string;
  state: string;
  ami_value: number;
  lmi_threshold: number;
  year: number;
  effective_date: string;
  expiration_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  activity_type: string;
  description: string;
  entity_type?: string;
  entity_id?: string;
  data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Dashboard Statistics Interface
export interface DashboardStats {
  totalSearches: number;
  lmiProperties: number;
  lmiPercentage: number;
  recentSearches: SearchHistory[];
  totalUsers?: number;
  totalProperties?: number;
  totalRealtors?: number;
  popularZipCodes?: Array<{zipCode: string, count: number}>;
}
