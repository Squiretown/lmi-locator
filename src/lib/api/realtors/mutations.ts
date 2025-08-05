import { supabase } from '@/integrations/supabase/client';
import { Realtor, RealtorFormValues, RealtorTable } from './types';

// Transform database row to Realtor object
function transformToRealtor(row: RealtorTable): Realtor {
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

export const createRealtor = async (realtor: RealtorFormValues): Promise<Realtor> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('realtors')
    .insert([{
      user_id: user.id,
      name: realtor.name,
      company: realtor.company,
      license_number: realtor.licenseNumber,
      email: realtor.email,
      phone: realtor.phone,
      address: realtor.address,
      website: realtor.website,
      bio: realtor.bio,
      status: realtor.status
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating realtor:', error);
    throw new Error(`Failed to create realtor: ${error.message}`);
  }

  return transformToRealtor(data);
};

export const updateRealtor = async (id: string, realtor: RealtorFormValues): Promise<Realtor> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('realtors')
    .update({
      name: realtor.name,
      company: realtor.company,
      license_number: realtor.licenseNumber,
      email: realtor.email,
      phone: realtor.phone,
      address: realtor.address,
      website: realtor.website,
      bio: realtor.bio,
      status: realtor.status,
      last_updated: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating realtor:', error);
    throw new Error(`Failed to update realtor: ${error.message}`);
  }

  return transformToRealtor(data);
};

export const deleteRealtor = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('realtors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting realtor:', error);
    throw new Error(`Failed to delete realtor: ${error.message}`);
  }
};