
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

export interface ApiUsage {
  id: string;
  api_name: string;
  count: number;
  date: string;
  status?: string;
  response_time?: number;
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
  title?: string;
  link_url?: string;
  delivered_at?: string;
  delivery_method?: string;
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

export interface BatchSearchJob {
  id: string;
  user_id: string;
  name: string;
  status: string;
  total_addresses: number;
  processed_addresses: number;
  addresses: Record<string, any>;
  results?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface MarketingJob {
  marketing_id: string;
  user_id: string;
  campaign_name: string;
  status: string;
  total_addresses: number;
  processed_addresses: number;
  eligible_addresses: number;
  created_at: string;
  completed_at?: string;
  notification_sent: boolean;
}

export interface MarketingAddress {
  id: string;
  marketing_id: string;
  address: string;
  status: string;
  is_eligible?: boolean;
  verification_details?: Record<string, any>;
  error_message?: string;
  created_at: string;
  verified_at?: string;
}

export interface RateLimit {
  id: string;
  ip_address: string;
  endpoint: string;
  count: number;
  first_request: string;
  last_request: string;
  is_blocked: boolean;
}

export interface VerificationChallenge {
  id: string;
  question: string;
  answers: string[];
  difficulty: number;
  is_active: boolean;
  created_at: string;
}

export interface LmiSearchErrorLog {
  id: string;
  user_id?: string;
  search_type: 'county' | 'zip' | 'tract';
  search_value: string;
  error_message: string;
  error_stack?: string;
  search_params?: Record<string, any>;
  created_at: string;
  browser_info?: string;
  resolved: boolean;
  resolution_notes?: string;
}
