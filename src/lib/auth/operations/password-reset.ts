
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
        toast.error("Rate limit reached", {
          description: "Please wait before requesting another password reset",
          duration: 6000
        });
        return { 
          success: false, 
          error: {
            message: 'Please wait before requesting another password reset (rate limit reached)',
            isRateLimited: true,
            retryAfter: extractRetrySeconds(error.message)
          } 
        };
      }
      
      toast.error("Password reset failed", {
        description: error.message || "Unable to send password reset email"
      });
      return { success: false, error };
    }
    
    toast.success('Password reset instructions sent!', {
      description: 'Please check your email to complete the process',
      duration: 6000
    });
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during password reset:', err);
    toast.error('An unexpected error occurred', {
      description: 'Unable to send password reset. Please try again later.'
    });
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
      toast.error("Password update failed", {
        description: error.message || "Unable to update your password"
      });
      return { success: false, error };
    }
    
    toast.success('Password updated successfully!', {
      description: 'You can now log in with your new password',
      duration: 6000
    });
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during password update:', err);
    toast.error('An unexpected error occurred', {
      description: 'Unable to update your password. Please try again later.'
    });
    return { success: false, error: err as Error };
  }
}
