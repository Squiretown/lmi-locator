// Define explicitly the necessary database types to use with Supabase
export interface ProfessionalTable {
  id: string;
  user_id: string;
  type: 'realtor' | 'mortgage_broker';
  name: string;
  company: string;
  license_number: string;
  email?: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  bio: string | null;
  photo_url: string | null;
  status: 'active' | 'pending' | 'inactive';
  social_media: any | null;
  is_verified: boolean | null;
  created_at: string;
  last_updated: string;
  notes: string | null;
  is_flagged: boolean | null;
}

export interface ProfessionalPermissionTable {
  id: string;
  professional_id: string;
  permission_name: string;
  granted_at: string;
}

export interface ContactTable {
  id: string;
  owner_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'lead' | 'client';
  created_at: string;
  last_updated: string;
  custom_fields: any | null;
}

export interface ContactInteractionTable {
  id: string;
  contact_id: string;
  user_id: string;
  type: 'note' | 'call' | 'email' | 'property_check';
  timestamp: string;
  description: string | null;
  metadata: any | null;
}

// Keep the RealtorTable for backward compatibility during transition
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
  user_id: string | null;
  // Additional fields that exist in the database
  is_flagged: boolean | null;
  notes: string | null;
  social_media: any | null;
  last_updated: string;
}
