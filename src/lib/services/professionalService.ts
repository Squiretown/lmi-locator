
import { supabase } from '@/integrations/supabase/client';
import { ProfessionalDTO, Professional, ProfessionalType, ProfessionalStatus } from '../types/professionalTypes';

export const getProfessionalForUser = async (userId: string): Promise<Professional[]> => {
  try {
    const result = await supabase
      .from('client_profiles')
      .select('professional_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (result.error || !result.data?.professional_id) {
      if (result.error) console.error('Error fetching client profile:', result.error);
      return [];
    }

    const profResult = await supabase
      .from('professionals')
      .select('*')
      .eq('id', result.data.professional_id);

    if (profResult.error) {
      console.error('Error fetching professionals:', profResult.error);
      return [];
    }

    return (profResult.data || []).map(transformProfessional);
  } catch (err) {
    console.error('Unexpected error in getProfessionalForUser:', err);
    return [];
  }
};

export const transformProfessional = (rawProf: ProfessionalDTO): Professional => {
  // Validate professional type
  const professionalType: ProfessionalType = 
    (rawProf.type === 'realtor' || rawProf.type === 'mortgage_broker') 
      ? rawProf.type 
      : 'realtor';
  
  // Validate status
  const statusValue: ProfessionalStatus = 
    (rawProf.status === 'active' || rawProf.status === 'pending' || rawProf.status === 'inactive')
      ? rawProf.status
      : 'pending';
  
  return {
    id: rawProf.id,
    userId: rawProf.user_id,
    type: professionalType,
    name: rawProf.name,
    company: rawProf.company,
    licenseNumber: rawProf.license_number,
    phone: rawProf.phone,
    address: rawProf.address,
    website: rawProf.website,
    bio: rawProf.bio,
    photoUrl: rawProf.photo_url,
    status: statusValue,
    createdAt: rawProf.created_at,
    lastUpdated: rawProf.last_updated,
    isVerified: !!rawProf.is_verified,
    isFlagged: !!rawProf.is_flagged,
    notes: rawProf.notes,
    socialMedia: rawProf.social_media || {}
  };
};
