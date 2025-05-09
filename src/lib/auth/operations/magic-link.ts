
import { supabase } from "@/integrations/supabase/client";
import { extractRetrySeconds } from './utils';

export async function signInWithMagicLink(email: string, redirectTo?: string) {
  try {
    console.log('Attempting to send magic link to:', email);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/login`
      }
    });
    
    if (error) {
      console.error('Magic link error:', error.message);
      
      // Special handling for rate limit errors
      if (error.message.includes('security purposes') || error.message.includes('rate limit')) {
        return { 
          success: false, 
          error: {
            message: 'Please wait before requesting another magic link (rate limit reached)',
            isRateLimited: true,
            retryAfter: extractRetrySeconds(error.message)
          } 
        };
      }
      
      return { success: false, error };
    }
    
    // Toast notification removed
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during magic link send:', err);
    // Toast notification removed
    return { success: false, error: err as Error };
  }
}
