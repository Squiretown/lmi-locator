/**
 * Raw database types that match exactly what comes from Supabase
 * These use snake_case to match database column names
 */
export interface DbClientProfile {
  user_id: string;
  professional_id: string | null;
  // other fields kept as is in database
}

export interface DbProfessional {
  id: string;
  user_id: string;
  type: string | null;
  name: string | null;
  company: string | null;
  license_number: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  bio: string | null;
  photo_url: string | null;
  status: string | null;
  created_at: string;
  last_updated: string | null;
  is_verified: boolean | null;
  is_flagged: boolean | null;
  notes: string | null;
  social_media: any | null;
}
