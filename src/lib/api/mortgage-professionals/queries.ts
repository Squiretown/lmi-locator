import { supabase } from '@/integrations/supabase/client';
import { MortgageProfessional, MortgageProfessionalTable } from './types';

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

export const fetchMortgageProfessionals = async (): Promise<MortgageProfessional[]> => {
  const { data, error } = await supabase
    .from('mortgage_professionals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching mortgage professionals:', error);
    throw new Error(`Failed to fetch mortgage professionals: ${error.message}`);
  }

  return (data || []).map(transformToMortgageProfessional);
};

export const getMortgageProfessionalByUserId = async (): Promise<MortgageProfessional | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('mortgage_professionals')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching mortgage professional by user ID:', error);
    throw new Error(`Failed to fetch mortgage professional: ${error.message}`);
  }

  return data ? transformToMortgageProfessional(data) : null;
};