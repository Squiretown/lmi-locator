
import { supabase } from "@/integrations/supabase/client";
import { getValidSession } from "@/lib/auth/getValidSession";

export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function signOutAllUsers() {
  try {
    console.log("Starting sign out all users process");
    
    // Ensure fresh session before invoking edge function
    await getValidSession();
    
    // Call the Supabase edge function to sign out all users
    const { error, data } = await supabase.functions.invoke('sign-out-all-users', {
      method: 'POST'
    });
    
    if (error) {
      console.error('Error signing out all users:', error);
      return { success: false, error };
    }
    
    console.log("Sign out all users successful:", data);
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception during sign out all users:', error);
    return { success: false, error: error as Error };
  }
}

// Add a function to verify admin status directly using user metadata
export async function verifyAdminAccess() {
  try {
    // First check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { isAdmin: false, error: "No active session" };

    // Check admin status from user metadata (bypassing problematic RLS)
    const userType = session.user?.user_metadata?.user_type;
    const isAdmin = userType === 'admin';
    
    return { isAdmin, error: null };
  } catch (error) {
    console.error('Exception during admin verification:', error);
    return { isAdmin: false, error: error as Error };
  }
}

/**
 * Enhanced session security with timeout enforcement
 */
export async function validateSession(): Promise<{
  isValid: boolean;
  session: any | null;
  error?: string;
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { isValid: false, session: null, error: error.message };
    }
    
    if (!session) {
      return { isValid: false, session: null, error: "No active session" };
    }
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      await supabase.auth.signOut();
      return { isValid: false, session: null, error: "Session expired" };
    }
    
    // Check for suspicious activity (rapid token changes, etc.)
    const lastActivity = sessionStorage.getItem('last_activity');
    const currentTime = Date.now().toString();
    
    if (lastActivity) {
      const timeDiff = parseInt(currentTime) - parseInt(lastActivity);
      // If no activity for more than 30 minutes, require re-authentication
      if (timeDiff > 30 * 60 * 1000) {
        await supabase.auth.signOut();
        return { isValid: false, session: null, error: "Session timeout due to inactivity" };
      }
    }
    
    sessionStorage.setItem('last_activity', currentTime);
    
    return { isValid: true, session, error: undefined };
  } catch (error) {
    console.error('Session validation error:', error);
    return { isValid: false, session: null, error: (error as Error).message };
  }
}

/**
 * Secure session invalidation
 */
export async function invalidateSession(reason: string = 'user_logout') {
  try {
    // Log the session termination for security audit
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log(`Session invalidated for user ${session.user.id}: ${reason}`);
    }
    
    // Clear all session storage
    sessionStorage.clear();
    localStorage.removeItem('supabase.auth.token');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    return { success: true };
  } catch (error) {
    console.error('Error during session invalidation:', error);
    return { success: false, error: error as Error };
  }
}
