
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
    // Call the Supabase admin API to sign out all users
    const { error } = await supabase.functions.invoke('sign-out-all-users', {
      method: 'POST'
    });
    
    if (error) {
      console.error('Error signing out all users:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception during sign out all users:', error);
    return { success: false, error: error as Error };
  }
}
