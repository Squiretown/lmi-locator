
import { supabase } from "@/integrations/supabase/client";

export async function signOutUser() {
  try {
    await supabase.auth.signOut();
    // Toast notification removed
  } catch (error) {
    console.error('Error signing out:', error);
    // Toast notification removed
    throw error;
  }
}

export async function signOutAllUsers() {
  try {
    // Fix: Pass a string instead of an object to match the expected type
    const { error } = await supabase.auth.admin.signOut('*');
    
    if (error) {
      console.error('Error signing out all users:', error);
      // Toast notification removed
      return { success: false, error };
    }
    
    // Toast notification removed
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception during sign out all users:', error);
    // Toast notification removed
    return { success: false, error: error as Error };
  }
}
