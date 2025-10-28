import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  user_id: string;
  user_type: string | null;
  phone: string | null;
  profile_image: string | null;
  company: string | null;
  bio: string | null;
  license_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  website: string | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        
        // Ensure professional profile exists for professional users
        if (data.user_type === 'mortgage_professional' || data.user_type === 'realtor') {
          await ensureProfessionalProfile(data);
        }
      } else {
        // Create profile if it doesn't exist
        const userType = user.user_metadata?.user_type || 'client';
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{ user_id: user.id, user_type: userType }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        
        // Ensure professional profile exists for professional users
        if (newProfile.user_type === 'mortgage_professional' || newProfile.user_type === 'realtor') {
          await ensureProfessionalProfile(newProfile);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const ensureProfessionalProfile = async (userProfile: UserProfile) => {
    try {
      // CRITICAL: Skip professional profile creation for admins and clients
      if (!userProfile.user_type || 
          userProfile.user_type === 'admin' || 
          userProfile.user_type === 'client') {
        console.log('Skipping professional profile creation for user_type:', userProfile.user_type);
        return;
      }

      // Only create for actual professional roles
      if (userProfile.user_type !== 'realtor' && 
          userProfile.user_type !== 'mortgage_professional') {
        console.log('User type not eligible for professional profile:', userProfile.user_type);
        return;
      }

      // Check if professional profile already exists
      const { data: existingProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', userProfile.user_id)
        .single();

      if (existingProfessional) return; // Already exists

      // Create professional profile
      const professionalData = {
        user_id: userProfile.user_id,
        professional_type: userProfile.user_type,
        name: user?.user_metadata?.first_name && user?.user_metadata?.last_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
          : user?.email?.split('@')[0] || 'Professional',
        company: userProfile.company || user?.user_metadata?.company || 'Professional Services',
        email: user?.email || '',
        phone: userProfile.phone || user?.user_metadata?.phone || '',
        license_number: userProfile.license_number || user?.user_metadata?.license_number || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zip_code: userProfile.zip_code || '',
        status: 'active'
      };

      const { error: professionalError } = await supabase
        .from('professionals')
        .insert([professionalData]);

      if (professionalError) {
        console.error('Error creating professional profile:', professionalError);
      } else {
        console.log('Professional profile created successfully');
      }
    } catch (error) {
      console.error('Error ensuring professional profile:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};