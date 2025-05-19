
import { supabase } from "@/integrations/supabase/client";
import { UserMetadata } from "@/types/auth";
import { getUserTypeName } from '@/lib/supabase/user';
import { toast } from "sonner";

export async function signInWithEmail(email: string, password: string) {
  try {
    console.log('Attempting to sign in:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    console.log('Sign in result:', error ? 'Error' : 'Success', data?.user?.email);
    
    if (error) {
      console.error('Sign in error:', error.message);
      toast.error("Sign in failed", {
        description: error.message || "Please check your credentials and try again"
      });
      return { userType: null, error };
    } else if (data?.user) {
      const userType = await getUserTypeName();
      const firstName = data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '';
      toast.success(`Welcome back${firstName ? ', ' + firstName : ''}!`, {
        description: "You have successfully signed in to your account"
      });
      return { userType, error: null };
    }
    
    return { userType: null, error: new Error('Unknown error occurred during sign in') };
  } catch (err) {
    console.error('Exception during sign in:', err);
    toast.error("Sign in failed", {
      description: "An unexpected error occurred. Please try again later."
    });
    return { userType: null, error: err as Error };
  }
}

export async function signUpWithEmail(email: string, password: string, metadata: UserMetadata = {}) {
  try {
    console.log('Attempting to sign up:', email, metadata);
    
    // Ensure user_type is included in metadata
    const formattedMetadata = {
      ...metadata,
      user_type: metadata.user_type || 'client'
    };
    
    // Log the actual data being sent to Supabase
    console.log('Signup data:', { email, metadata: formattedMetadata });
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: formattedMetadata,
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
    
    console.log('Sign up result:', error ? 'Error' : 'Success', data);
    
    if (error) {
      console.error('Sign up error:', error.message);
      toast.error("Sign up failed", {
        description: error.message || "Please check your information and try again"
      });
      return { error, data: null };
    } else if (data?.user) {
      const firstName = metadata.first_name || email.split('@')[0];
      toast.success(`Welcome${firstName ? ', ' + firstName : ''}!`, {
        description: "Your account has been created successfully"
      });
      
      const requiresEmailConfirmation = !data.session;
      
      if (requiresEmailConfirmation) {
        toast.info("Verification needed", {
          description: "Please check your email to confirm your account",
          duration: 6000
        });
      }
    }
    
    return { error, data };
  } catch (err) {
    console.error('Exception during sign up:', err);
    toast.error("Sign up failed", {
      description: "An unexpected error occurred while creating your account"
    });
    return { error: err as Error, data: null };
  }
}

export async function updateUserEmail(currentEmail: string, newEmail: string, password: string) {
  try {
    console.log('Attempting to update email from:', currentEmail, 'to:', newEmail);
    
    // First verify the current password is correct
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: password,
    });
    
    if (signInError) {
      console.error('Password verification error:', signInError);
      toast.error("Verification failed", {
        description: "Current password is incorrect. Please try again."
      });
      return { success: false, error: new Error('Current password is incorrect') };
    }
    
    // Then update the email
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    
    if (error) {
      console.error('Email update error:', error);
      toast.error("Email update failed", {
        description: error.message || "Unable to update your email address"
      });
      return { success: false, error };
    }
    
    toast.success("Email updated", {
      description: "Your email has been updated successfully. Please verify your new email."
    });
    return { success: true, data, error: null };
  } catch (err) {
    console.error('Exception during email update:', err);
    toast.error("Email update failed", {
      description: "An unexpected error occurred while updating your email"
    });
    return { success: false, error: err as Error };
  }
}
