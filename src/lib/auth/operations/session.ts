
import { supabase } from "@/integrations/supabase/client";

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
    
    // Get current auth token to confirm we're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No active session found");
      return { success: false, error: new Error("No active session") };
    }
    
    console.log("Session found, proceeding with sign out all users");
    
    // Call the Supabase edge function to sign out all users
    const { error, data } = await supabase.functions.invoke('sign-out-all-users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
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
