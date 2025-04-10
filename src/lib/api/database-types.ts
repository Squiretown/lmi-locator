
// Define explicitly the necessary database types to use with Supabase
export interface MortgageBrokerTable {
  id: string;
  name: string;
  company: string;
  license_number: string;
  email: string;
  phone: string | null;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

export interface BrokerPermissionTable {
  id: string;
  broker_id: string;
  permission_name: string;
  granted_at: string;
}

export interface RealtorTable {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  brokerage: string;
  license_number: string;
  status: 'active' | 'pending' | 'inactive';
  website: string | null;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  is_flagged?: boolean;
  notes?: string | null;
  social_media?: any;
  last_updated?: string;
  user_id?: string;
}
