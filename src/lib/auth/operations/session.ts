
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function signOutUser() {
  try {
    await supabase.auth.signOut();
    toast.success("Signed out successfully", {
      description: "You have been logged out of your account"
    });
  } catch (error) {
    console.error('Error signing out:', error);
    toast.error("Failed to sign out", {
      description: "There was a problem signing you out. Please try again."
    });
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
      toast.error("Authentication error", {
        description: "You need to be logged in to perform this action"
      });
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
      toast.error("Operation failed", {
        description: `Failed to sign out all users: ${error.message || 'Unknown error'}`
      });
      return { success: false, error };
    }
    
    console.log("Sign out all users successful:", data);
    toast.success("Operation successful", {
      description: "All users have been signed out successfully"
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception during sign out all users:', error);
    toast.error("Unexpected error", {
      description: "An unexpected error occurred while signing out all users"
    });
    return { success: false, error: error as Error };
  }
}

// Add a function to verify admin status directly
export async function verifyAdminAccess() {
  try {
    // First check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { isAdmin: false, error: "No active session" };

    // Then verify admin status
    const { data: isAdmin, error } = await supabase.rpc('user_is_admin');
    
    if (error) {
      console.error('Error verifying admin status:', error);
      return { isAdmin: false, error: error.message };
    }
    
    return { isAdmin: !!isAdmin, error: null };
  } catch (error) {
    console.error('Exception during admin verification:', error);
    return { isAdmin: false, error: error as Error };
  }
}
