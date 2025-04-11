
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export async function updateUserEmail(newEmail: string) {
  try {
    console.log('Attempting to update email to:', newEmail);
    
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    
    if (error) {
      console.error('Email update error:', error);
      return { success: false, error };
    }
    
    toast.success('Email update initiated. Please check your inbox for confirmation.');
    return { success: true, data, error: null };
  } catch (err) {
    console.error('Exception during email update:', err);
    return { success: false, error: err as Error };
  }
}

