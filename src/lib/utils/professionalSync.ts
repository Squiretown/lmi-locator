import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/hooks/useUserProfile';

export interface ProfessionalSyncData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  bio?: string;
  website?: string;
  license_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  professional_bio?: string;
  company_address?: string;
  company_website?: string;
  job_title?: string;
  user_type?: string;
}

/**
 * Synchronizes profile data between user_profiles, professionals, and auth metadata
 * This ensures data consistency across all professional-related tables
 */
export const syncProfessionalProfile = async (
  userId: string,
  profileData: ProfessionalSyncData,
  userType?: string
): Promise<{ userProfile?: any; professional?: any; error?: string }> => {
  try {
    console.log('Starting professional profile sync for user:', userId);
    console.log('Profile data:', profileData);

    // Update auth metadata first
    const authUpdates: any = {};
    if (profileData.first_name) authUpdates.first_name = profileData.first_name;
    if (profileData.last_name) authUpdates.last_name = profileData.last_name;
    if (profileData.license_number) authUpdates.license_number = profileData.license_number;
    if (profileData.user_type) authUpdates.user_type = profileData.user_type;

    if (Object.keys(authUpdates).length > 0) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: authUpdates
      });
      
      if (metadataError) {
        console.error('Failed to update auth metadata:', metadataError);
        throw new Error(`Failed to update auth metadata: ${metadataError.message}`);
      }
    }

    // Update user_profiles table
    const userProfileUpdates: Partial<UserProfile> = {};
    if (profileData.phone) userProfileUpdates.phone = profileData.phone;
    if (profileData.company) userProfileUpdates.company = profileData.company;
    if (profileData.bio) userProfileUpdates.bio = profileData.bio;
    if (profileData.website) userProfileUpdates.website = profileData.website;
    if (profileData.license_number) userProfileUpdates.license_number = profileData.license_number;
    if (profileData.address) userProfileUpdates.address = profileData.address;
    if (profileData.city) userProfileUpdates.city = profileData.city;
    if (profileData.state) userProfileUpdates.state = profileData.state;
    if (profileData.zip_code) userProfileUpdates.zip_code = profileData.zip_code;

    let updatedUserProfile = null;
    if (Object.keys(userProfileUpdates).length > 0) {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profiles')
        .update(userProfileUpdates)
        .eq('user_id', userId)
        .select()
        .single();

      if (userProfileError) {
        console.error('Failed to update user profile:', userProfileError);
        throw new Error(`Failed to update user profile: ${userProfileError.message}`);
      }
      updatedUserProfile = userProfileData;
    }

    // Update professionals table if user is a professional
    const currentUserType = userType || profileData.user_type;
    let updatedProfessional = null;
    
    if (currentUserType === 'realtor' || currentUserType === 'mortgage_professional') {
      // Check if professional record exists
      const { data: existingProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', userId)
        .single();

      const professionalUpdates: any = {};
      if (profileData.first_name && profileData.last_name) {
        professionalUpdates.name = `${profileData.first_name} ${profileData.last_name}`;
      }
      if (profileData.company) professionalUpdates.company = profileData.company;
      if (profileData.license_number) professionalUpdates.license_number = profileData.license_number;
      if (profileData.phone) professionalUpdates.phone = profileData.phone;
      if (profileData.address) professionalUpdates.address = profileData.address;
      if (profileData.website) professionalUpdates.website = profileData.website;
      if (profileData.professional_bio) professionalUpdates.bio = profileData.professional_bio;
      if (profileData.bio && !profileData.professional_bio) professionalUpdates.bio = profileData.bio;

      if (existingProfessional) {
        // Update existing professional record
        if (Object.keys(professionalUpdates).length > 0) {
          const { data: professionalData, error: professionalError } = await supabase
            .from('professionals')
            .update(professionalUpdates)
            .eq('user_id', userId)
            .select()
            .single();

          if (professionalError) {
            console.error('Failed to update professional:', professionalError);
            throw new Error(`Failed to update professional: ${professionalError.message}`);
          }
          updatedProfessional = professionalData;
        }
      } else {
        // Create new professional record
        const newProfessionalData = {
          user_id: userId,
          professional_type: currentUserType,
          name: (profileData.first_name && profileData.last_name) 
            ? `${profileData.first_name} ${profileData.last_name}` 
            : '',
          company: profileData.company || '',
          license_number: profileData.license_number || '',
          status: 'active',
          ...professionalUpdates
        };

        const { data: professionalData, error: professionalError } = await supabase
          .from('professionals')
          .insert([newProfessionalData])
          .select()
          .single();

        if (professionalError) {
          console.error('Failed to create professional:', professionalError);
          throw new Error(`Failed to create professional: ${professionalError.message}`);
        }
        updatedProfessional = professionalData;
      }
    }

    console.log('Professional profile sync completed successfully');
    return { 
      userProfile: updatedUserProfile, 
      professional: updatedProfessional 
    };

  } catch (error: any) {
    console.error('Professional profile sync failed:', error);
    return { error: error.message };
  }
};

/**
 * Gets the current professional profile for a user
 */
export const getProfessionalProfile = async (userId: string) => {
  try {
    const { data: professional, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return professional;
  } catch (error: any) {
    console.error('Error fetching professional profile:', error);
    return null;
  }
};