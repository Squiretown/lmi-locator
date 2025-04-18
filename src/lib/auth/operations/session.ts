
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export async function signOutUser() {
  try {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    toast.error('Error signing out');
    throw error;
  }
}

export async function signOutAllUsers() {
  try {
    // Fix: Pass a string instead of an object to match the expected type
    const { error } = await supabase.auth.admin.signOut('*');
    
    if (error) {
      console.error('Error signing out all users:', error);
      toast.error(`Failed to sign out all users: ${error.message}`);
      return { success: false, error };
    }
    
    toast.success('All users have been signed out successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception during sign out all users:', error);
    toast.error('An unexpected error occurred while signing out all users');
    return { success: false, error: error as Error };
  }
}
