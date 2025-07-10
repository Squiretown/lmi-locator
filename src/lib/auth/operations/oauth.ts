import { supabase } from "@/integrations/supabase/client";
import { Provider } from '@supabase/supabase-js';

export interface OAuthSignInOptions {
  redirectTo?: string;
  userType?: string;
}

export async function signInWithOAuth(provider: Provider, options: OAuthSignInOptions = {}) {
  try {
    console.log(`Attempting OAuth sign in with ${provider}`);
    
    const redirectTo = options.redirectTo || `${window.location.origin}/login`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          user_type: options.userType || 'client'
        }
      }
    });
    
    if (error) {
      console.error(`OAuth ${provider} error:`, error.message);
      return { success: false, error };
    }
    
    console.log(`OAuth ${provider} initiated successfully`);
    return { success: true, error: null, data };
  } catch (err) {
    console.error(`Exception during OAuth ${provider} sign in:`, err);
    return { success: false, error: err as Error };
  }
}

export async function signInWithGoogle(options: OAuthSignInOptions = {}) {
  return signInWithOAuth('google', options);
}

export async function signInWithGitHub(options: OAuthSignInOptions = {}) {
  return signInWithOAuth('github', options);
}

export async function signInWithMicrosoft(options: OAuthSignInOptions = {}) {
  return signInWithOAuth('azure', options);
}

export async function signInWithDiscord(options: OAuthSignInOptions = {}) {
  return signInWithOAuth('discord', options);
}