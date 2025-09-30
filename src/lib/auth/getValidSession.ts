import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures the current session is valid and refreshes the token if needed.
 * 
 * This function provides an explicit validation point before critical operations
 * like calling edge functions. While Supabase SDK automatically handles token
 * refresh, this gives us a clear checkpoint to catch auth issues early.
 * 
 * @throws {Error} If user is not authenticated or session cannot be validated
 * @returns {Promise<{ user: User }>} The authenticated user object
 * 
 * @example
 * ```typescript
 * // Use before edge function calls
 * await getValidSession();
 * const { data, error } = await supabase.functions.invoke('my-function');
 * ```
 */
export async function getValidSession() {
  try {
    // getUser() automatically refreshes the token if it's about to expire
    // This is the recommended way to validate sessions in Supabase
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Session validation failed:', error.message);
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (!user) {
      throw new Error('No authenticated user found. Please log in.');
    }
    
    // Successfully validated - token is fresh
    return { user };
  } catch (error) {
    console.error('Error validating session:', error);
    throw error;
  }
}

/**
 * Alternative: Explicitly refresh the session token
 * Use this if you need more control over the refresh process
 * 
 * @throws {Error} If session refresh fails
 * @returns {Promise<{ session: Session, user: User }>}
 */
export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh failed:', error.message);
      throw new Error('Failed to refresh authentication. Please log in again.');
    }
    
    if (!session) {
      throw new Error('No active session found. Please log in.');
    }
    
    return { session, user: session.user };
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
}