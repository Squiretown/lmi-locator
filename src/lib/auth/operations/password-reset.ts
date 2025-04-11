
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { extractRetrySeconds } from './utils';

export async function resetPassword(email: string, redirectTo?: string) {
  try {
    console.log('Attempting to send password reset to:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error.message);
      
      // Special handling for rate limit errors
      if (error.message.includes('security purposes') || error.message.includes('rate limit')) {
        return { 
          success: false, 
          error: {
            message: 'Please wait before requesting another password reset (rate limit reached)',
            isRateLimited: true,
            retryAfter: extractRetrySeconds(error.message)
          } 
        };
      }
      
      return { success: false, error };
    }
    
    toast.success('Password reset instructions sent! Please check your email.');
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during password reset:', err);
    toast.error('An unexpected error occurred');
    return { success: false, error: err as Error };
  }
}

export async function updatePasswordWithToken(newPassword: string) {
  try {
    console.log('Attempting to update password with token');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Password update error:', error.message);
      return { success: false, error };
    }
    
    toast.success('Password updated successfully! You can now log in with your new password.');
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during password update:', err);
    toast.error('An unexpected error occurred');
    return { success: false, error: err as Error };
  }
}
