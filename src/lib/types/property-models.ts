
import { JsonRecord } from './api-responses';

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

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  notes?: string;
  created_at: string;
  folder: string;
  is_favorite: boolean;
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

export interface SearchHistory {
  id: string;
  user_id?: string | null;
  address: string;
  ip_address?: string | null;
  search_params: JsonRecord;
  result: JsonRecord;
  result_count?: number | null;
  lmi_result_count?: number | null;
  searched_at?: string;
  income_category?: string | null;
  is_eligible?: boolean | null;
  tract_id?: string | null;
  search_query?: string | null;
  user_agent?: string | null;
}
