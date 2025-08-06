
import { supabase } from '@/integrations/supabase/client';
import { ProfessionalTable } from '../database-types';
import { Professional, ProfessionalFormValues } from '../types';
import { transformProfessional } from '../utils/transformers';

export const createProfessional = async (professional: ProfessionalFormValues): Promise<Professional> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      throw new Error(`Authentication required: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('User must be authenticated to create professional profiles');
    }

    // Prepare the professional data
    const professionalData = {
      user_id: user.id,
      type: professional.type,
      professional_type: professional.type,
      name: professional.name,
      company: professional.company,
      license_number: professional.licenseNumber,
      phone: professional.phone || null,
      address: professional.address || null,
      website: professional.website || null,
      bio: professional.bio || null,
      photo_url: professional.photoUrl || null,
      status: professional.status
    };

    const { data, error } = await supabase
      .from('professionals')
      .insert([professionalData])
      .select()
      .single();

    if (error) {
      console.error('Error creating professional:', error);
      throw new Error(`Failed to create professional: ${error.message}`);
    }

    return transformProfessional(data as ProfessionalTable);
  } catch (err) {
    console.error('Error in createProfessional:', err);
    throw err;
  }
};

export const updateProfessional = async (id: string, professional: ProfessionalFormValues): Promise<Professional> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required to update professional');
    }

    // Prepare the professional data
    const professionalData = {
      name: professional.name,
      company: professional.company,
      license_number: professional.licenseNumber,
      phone: professional.phone || null,
      address: professional.address || null,
      website: professional.website || null,
      bio: professional.bio || null,
      photo_url: professional.photoUrl || null,
      status: professional.status
    };

    const { data, error } = await supabase
      .from('professionals')
      .update(professionalData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating professional:', error);
      throw new Error(`Failed to update professional: ${error.message}`);
    }

    return transformProfessional(data as ProfessionalTable);
  } catch (err) {
    console.error('Error in updateProfessional:', err);
    throw err;
  }
};

export const deleteProfessional = async (id: string): Promise<void> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required to delete professional');
    }

    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting professional:', error);
      throw new Error(`Failed to delete professional: ${error.message}`);
    }
  } catch (err) {
    console.error('Error in deleteProfessional:', err);
    throw err;
  }
};
