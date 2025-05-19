
import { supabase } from "@/integrations/supabase/client";
import { extractRetrySeconds } from './utils';
import { toast } from "sonner";

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
        toast.error("Rate limit reached", {
          description: "Please wait before requesting another magic link",
          duration: 6000
        });
        return { 
          success: false, 
          error: {
            message: 'Please wait before requesting another magic link (rate limit reached)',
            isRateLimited: true,
            retryAfter: extractRetrySeconds(error.message)
          } 
        };
      }
      
      toast.error("Magic link failed", {
        description: error.message || "Unable to send magic link"
      });
      return { success: false, error };
    }
    
    toast.success('Magic link sent!', {
      description: 'Check your email inbox for the login link',
      duration: 6000
    });
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during magic link send:', err);
    toast.error('An unexpected error occurred', {
      description: 'Unable to send magic link. Please try again later.'
    });
    return { success: false, error: err as Error };
  }
}
