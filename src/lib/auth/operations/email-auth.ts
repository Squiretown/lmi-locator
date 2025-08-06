
import { supabase } from "@/integrations/supabase/client";
import { UserMetadata } from "@/types/auth";
import { getUserTypeName } from '@/lib/supabase/user';

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
      const firstName = data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '';
      return { userType, error: null };
    }
    
    return { userType: null, error: new Error('Unknown error occurred during sign in') };
  } catch (err) {
    console.error('Exception during sign in:', err);
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
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    console.log('Sign up result:', error ? 'Error' : 'Success', data);
    
    if (error) {
      console.error('Sign up error:', error.message);
      return { error, data: null };
    }

    // If signup successful and user is a professional, create professional profile
    if (data.user && data.session) {
      const userType = formattedMetadata.user_type;
      
      if (userType === 'realtor' || userType === 'mortgage_professional') {
        try {
          console.log('Creating professional profile for:', userType);
          
          // Create professional profile
          const professionalData = {
            user_id: data.user.id,
            type: userType,
            professional_type: userType,
            name: `${formattedMetadata.first_name || ''} ${formattedMetadata.last_name || ''}`.trim() || 'New Professional',
            company: formattedMetadata.company || 'Not Specified',
            license_number: formattedMetadata.license_number || 'Pending',
            phone: formattedMetadata.phone || null,
            email: email,
            status: 'pending' as const
          };

          const { error: professionalError } = await supabase
            .from('professionals')
            .insert([professionalData]);

          if (professionalError) {
            console.error('Error creating professional profile:', professionalError);
            // Don't fail the signup, but log the error
            // The user can complete their profile later
          } else {
            console.log('Professional profile created successfully');
          }
        } catch (professionalErr) {
          console.error('Exception creating professional profile:', professionalErr);
          // Don't fail the signup, but log the error
        }
      }
    }
    
    const requiresEmailConfirmation = !data.session;
    
    if (requiresEmailConfirmation) {
      console.log('Email verification required');
    }
    
    return { error, data };
  } catch (err) {
    console.error('Exception during sign up:', err);
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
      return { success: false, error: new Error('Current password is incorrect') };
    }
    
    // Then update the email
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    
    if (error) {
      console.error('Email update error:', error);
      return { success: false, error };
    }
    
    return { success: true, data, error: null };
  } catch (err) {
    console.error('Exception during email update:', err);
    return { success: false, error: err as Error };
  }
}
