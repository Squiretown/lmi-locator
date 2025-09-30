import { supabase } from '@/integrations/supabase/client';

/**
 * Gets a valid, fresh Supabase session by forcing a token refresh.
 * This ensures the JWT token is not stale when calling edge functions.
 * 
 * @throws Error if no session exists or refresh fails
 * @returns Fresh Supabase session with valid JWT token
 */
export async function getValidSession() {
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error || !data.session) {
    throw new Error('Authentication failed. Please sign in again.');
  }
  
  return data.session;
}
