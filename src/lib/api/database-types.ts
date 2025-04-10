
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
