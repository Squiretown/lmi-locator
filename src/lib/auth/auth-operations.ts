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
      return { userType: null, error };
    } else if (data?.user) {
      const userType = await getUserTypeName();
      toast.success('Signed in successfully');
      return { userType, error: null };
    }
    
    return { userType: null, error: new Error('Unknown error occurred during sign in') };
  } catch (err) {
    console.error('Exception during sign in:', err);
    toast.error('An unexpected error occurred during login');
    return { userType: null, error: err as Error };
  }
}

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
      return { success: false, error };
    }
    
    toast.success('Magic link sent! Please check your email.');
    return { success: true, error: null };
  } catch (err) {
    console.error('Exception during magic link send:', err);
    toast.error('An unexpected error occurred');
    return { success: false, error: err as Error };
  }
}

export async function resetPassword(email: string) {
  try {
    console.log('Attempting to send password reset to:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error.message);
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

/**
 * Create an initial admin user if no admins exist
 */
export async function createInitialAdminUser() {
  try {
    // Check if any admin users already exist
    const { data: existingAdmins } = await supabase.rpc('user_is_admin');
    
    if (existingAdmins) {
      console.log('Admin user already exists');
      return null;
    }

    // Create a more secure password with special characters, numbers, and mixed case
    const adminEmail = 'admin@example.com';
    // More complex password that should pass Supabase's strength check
    const adminPassword = `Admin${Math.random().toString(36).slice(2)}!${Math.random().toString(36).toUpperCase().slice(2)}@${Date.now().toString().slice(-4)}`;

    const { data, error } = await supabase.auth.signUp({
      email: adminEmail, 
      password: adminPassword,
      options: { 
        data: {
          user_type: 'admin',
          first_name: 'System',
          last_name: 'Administrator'
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      toast.error('Failed to create initial admin user');
      return null;
    }

    if (data?.user) {
      toast.success('Initial admin user created successfully');
      console.log('Initial admin user created:', data.user.email);
      return { email: adminEmail, password: adminPassword };
    }

    return null;
  } catch (error) {
    console.error('Exception during admin user creation:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}
