import { supabase } from "@/integrations/supabase/client";
import { extractRetrySeconds } from './utils';

/**
 * Send a password reset email to the specified address
 * ✅ Now uses correct production URL for lmicheck.com
 */
export async function resetPassword(email: string, redirectTo?: string) {
  try {
    console.log('Attempting to send password reset to:', email);
    
    // ✅ FIX: Use production domain if no redirectTo specified
    const baseUrl = window.location.origin;
    const defaultRedirectUrl = baseUrl.includes('localhost') 
      ? `${baseUrl}/reset-password`
      : `https://lmicheck.com/reset-password`;
    
    const finalRedirectUrl = redirectTo || defaultRedirectUrl;
    console.log(`Using redirect URL: ${finalRedirectUrl}`);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: finalRedirectUrl,
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
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during password reset:', err);
    return { success: false, error: err as Error };
  }
}

/**
 * Update user password using a valid recovery token
 * This is called after the user clicks the reset link and arrives at /reset-password
 */
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
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during password update:', err);
    return { success: false, error: err as Error };
  }
}