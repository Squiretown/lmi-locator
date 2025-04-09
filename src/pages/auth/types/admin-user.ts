
import type { User } from '@supabase/supabase-js';

// Define our AdminUser type separately instead of extending the User type
// to avoid the type compatibility issue
export interface AdminUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    user_type?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface UserManagementState {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
}
