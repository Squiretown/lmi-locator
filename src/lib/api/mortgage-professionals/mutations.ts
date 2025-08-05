import { supabase } from '@/integrations/supabase/client';
import { MortgageProfessional, MortgageProfessionalFormValues, MortgageProfessionalTable } from './types';

// Transform database row to MortgageProfessional object
function transformToMortgageProfessional(row: MortgageProfessionalTable): MortgageProfessional {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    company: row.company,
    licenseNumber: row.license_number,
    email: row.email,
    phone: row.phone,
    address: row.address,
    website: row.website,
    bio: row.bio,
    photoUrl: row.photo_url,
    status: row.status as 'active' | 'pending' | 'inactive',
    socialMedia: row.social_media,
    isVerified: row.is_verified || false,
    isFlagged: row.is_flagged || false,
    notes: row.notes,
    createdAt: row.created_at,
    lastUpdated: row.last_updated
  };
}

export const createMortgageProfessional = async (professional: MortgageProfessionalFormValues): Promise<MortgageProfessional> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('mortgage_professionals')
    .insert([{
      user_id: user.id,
      name: professional.name,
      company: professional.company,
      license_number: professional.licenseNumber,
      email: professional.email,
      phone: professional.phone,
      address: professional.address,
      website: professional.website,
      bio: professional.bio,
      status: professional.status
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating mortgage professional:', error);
    throw new Error(`Failed to create mortgage professional: ${error.message}`);
  }

  return transformToMortgageProfessional(data);
};

export const updateMortgageProfessional = async (id: string, professional: MortgageProfessionalFormValues): Promise<MortgageProfessional> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('mortgage_professionals')
    .update({
      name: professional.name,
      company: professional.company,
      license_number: professional.licenseNumber,
      email: professional.email,
      phone: professional.phone,
      address: professional.address,
      website: professional.website,
      bio: professional.bio,
      status: professional.status,
      last_updated: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating mortgage professional:', error);
    throw new Error(`Failed to update mortgage professional: ${error.message}`);
  }

  return transformToMortgageProfessional(data);
};

export const deleteMortgageProfessional = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('mortgage_professionals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting mortgage professional:', error);
    throw new Error(`Failed to delete mortgage professional: ${error.message}`);
  }
};