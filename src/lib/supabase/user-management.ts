
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes the current user's account using secure server-side validation
 * This will remove the user from auth.users and cascade delete related data
 * @param currentPassword Required for security - user must confirm password
 * @returns Success status and any error message
 */
export async function deleteUserAccount(currentPassword: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get current session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error("Not authenticated:", sessionError);
      return { 
        success: false, 
        error: new Error("You must be logged in to delete your account")
      };
    }

    // Call the secure Edge Function for account deletion
    const { data, error } = await supabase.functions.invoke('secure-delete-user-account', {
      body: { currentPassword },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error("Account deletion failed:", error);
      return { 
        success: false, 
        error: new Error(error.message || "Failed to delete account. Please try again.")
      };
    }

    if (!data?.success) {
      return { 
        success: false, 
        error: new Error(data?.error || "Failed to delete account")
      };
    }

    // Signal success
    return { 
      success: true, 
      error: null 
    };
  } catch (err) {
    console.error("Exception during account deletion:", err);
    return { 
      success: false, 
      error: err as Error 
    };
  }
}
