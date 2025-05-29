
import type { User } from '@supabase/supabase-js';

// Define our AdminUser type to match what we actually get from Supabase
export interface AdminUser {
  id: string;
  email?: string; // Make email optional to match Supabase User type
  created_at: string;
  last_sign_in_at?: string | null;
  user_metadata?: {
    user_type?: string;
    first_name?: string;
    last_name?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

export interface UserManagementState {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
}
