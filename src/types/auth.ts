
import { User, Session } from '@supabase/supabase-js';

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  user_type?: string;
  company?: string;
  license_number?: string;
  phone?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: string | null;
  isLoading: boolean;
  authInitialized: boolean; // New property to indicate auth has initialized
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ error: Error | null, data: any }>;
  signOut: () => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<{ success: boolean; error: Error | null }>;
}
