
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { getUserTypeName } from '@/lib/supabase/user';
import { deleteUserAccount } from '@/lib/supabase/user-management';
import { UserMetadata } from "@/types/auth";

export async function signInWithEmail(email: string, password: string) {
  try {
    console.log('Attempting to sign in:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    console.log('Sign in result:', error ? 'Error' : 'Success', data?.user?.email);
    
    if (error) {
      console.error('Sign in error:', error.message);
      
      if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email address before signing in.');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    } else if (data?.user) {
      const userType = await getUserTypeName();
      toast.success('Signed in successfully');
      return { userType, error: null };
    }
    
    return { userType: null, error };
  } catch (err) {
    console.error('Exception during sign in:', err);
    toast.error('An unexpected error occurred during login');
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
      
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else if (error.message.includes('permission denied')) {
        console.error('Permission denied error details:', error);
        toast.error('Account creation failed due to permission issues. Please contact support.');
      } else if (error.message.includes('weak password')) {
        toast.error('Please use a stronger password that meets all requirements.');
      } else {
        toast.error(`Sign up failed: ${error.message}`);
      }
      return { error, data: null };
    } else if (data?.user) {
      toast.success('Account created successfully!');
      
      const requiresEmailConfirmation = !data.session;
      
      if (requiresEmailConfirmation) {
        toast.info('Please check your email to confirm your account before logging in.');
      }
    }
    
    return { error, data };
  } catch (err) {
    console.error('Exception during sign up:', err);
    toast.error('An unexpected error occurred during sign up');
    return { error: err as Error, data: null };
  }
}

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

export async function deleteUserWithPassword(currentPassword: string) {
  try {
    const result = await deleteUserAccount(currentPassword);
    
    if (result.success) {
      toast.success('Your account has been deleted successfully');
    } else if (result.error) {
      toast.error(`Failed to delete account: ${result.error.message}`);
    }
    
    return result;
  } catch (err) {
    console.error('Exception during account deletion:', err);
    toast.error('An unexpected error occurred while deleting your account');
    return { success: false, error: err as Error };
  }
}
