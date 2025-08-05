import { supabase } from '@/integrations/supabase/client';
import { Realtor, RealtorTable } from './types';

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

export const fetchRealtors = async (): Promise<Realtor[]> => {
  const { data, error } = await supabase
    .from('realtors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching realtors:', error);
    throw new Error(`Failed to fetch realtors: ${error.message}`);
  }

  return (data || []).map(transformToRealtor);
};

export const getRealtorByUserId = async (): Promise<Realtor | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('realtors')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching realtor by user ID:', error);
    throw new Error(`Failed to fetch realtor: ${error.message}`);
  }

  return data ? transformToRealtor(data) : null;
};