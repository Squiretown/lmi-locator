
import { supabase } from '@/integrations/supabase/client';
import { ProfessionalDTO, Professional, ProfessionalType, ProfessionalStatus } from '../types/professionalTypes';

export const getProfessionalForUser = async (userId: string): Promise<Professional[]> => {
  try {
    const { data: clientProfile, error } = await supabase
      .from('client_profiles')
      .select('professional_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !clientProfile?.professional_id) {
      if (error) console.error('Error fetching client profile:', error);
      return [];
    }

    const { data: professionals, error: profError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', clientProfile.professional_id);

    if (profError) {
      console.error('Error fetching professionals:', profError);
      return [];
    }

    return (professionals || []).map(transformProfessional);
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
    phone: rawProf.phone || null,
    address: rawProf.address || null,
    website: rawProf.website || null,
    bio: rawProf.bio || null,
    photoUrl: rawProf.photo_url || null,
    status: statusValue,
    createdAt: rawProf.created_at,
    lastUpdated: rawProf.last_updated || rawProf.created_at,
    isVerified: !!rawProf.is_verified,
    isFlagged: !!rawProf.is_flagged,
    notes: rawProf.notes || null,
    socialMedia: rawProf.social_media || {}
  };
};
