
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes the current user's account
 * This will remove the user from auth.users and cascade delete related data
 * @param currentPassword Required for security - user must confirm password
 * @returns Success status and any error message
 */
export async function deleteUserAccount(currentPassword: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    // First verify the user's password for security
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !user) {
      console.error("Not authenticated:", sessionError);
      return { 
        success: false, 
        error: new Error("You must be logged in to delete your account")
      };
    }

    // Verify password before proceeding with deletion
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: currentPassword,
    });

    if (verifyError) {
      console.error("Password verification failed:", verifyError);
      return { 
        success: false, 
        error: new Error("Incorrect password. Please verify your current password and try again.")
      };
    }

    // If password verified, proceed with account deletion
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("Failed to delete account:", deleteError);
      return { 
        success: false, 
        error: deleteError 
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
