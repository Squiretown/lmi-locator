import { Professional, ProfessionalType, ProfessionalStatus } from '../types/modelTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Get professionals assigned to a user - using secure direct queries
 */
export async function getProfessionalForUser(userId: string): Promise<Professional[]> {
  try {
    // Get client profile using secure Supabase client
    const { data: clientProfile, error: clientError } = await supabase
      .from('client_profiles')
      .select('professional_id')
      .eq('user_id', userId)
      .single();
    
    if (clientError || !clientProfile?.professional_id) {
      return [];
    }
    
    const professionalId = clientProfile.professional_id;
    
    // Get professional details using secure Supabase client
    const { data: professionals, error: profError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', professionalId);
    
    if (profError || !professionals?.length) {
      return [];
    }
    
    // Convert raw data to Professional objects
    return professionals.map(createProfessionalModel);
  } catch (err) {
    console.error('Unexpected error in getProfessionalForUser:', err);
    return [];
  }
}

/**
 * Create a Professional model from raw database data
 */
function createProfessionalModel(rawData: any): Professional {
  return {
    id: rawData.id || '',
    userId: rawData.user_id || '',
    type: validateProfessionalType(rawData.type),
    name: rawData.name || '',
    company: rawData.company || '',
    licenseNumber: rawData.license_number || '',
    phone: rawData.phone || '',
    address: rawData.address || '',
    website: rawData.website || '',
    bio: rawData.bio || '',
    photoUrl: rawData.photo_url || '',
    status: validateProfessionalStatus(rawData.status),
    createdAt: rawData.created_at || '',
    lastUpdated: rawData.last_updated || '',
    isVerified: !!rawData.is_verified,
    isFlagged: !!rawData.is_flagged,
    notes: rawData.notes || '',
    socialMedia: rawData.social_media || {}
  };
}

/**
 * Validate and convert professional type
 */
function validateProfessionalType(type: any): ProfessionalType {
  return (type === 'realtor' || type === 'mortgage_broker') 
    ? type as ProfessionalType 
    : 'realtor';
}

/**
 * Validate and convert professional status
 */
function validateProfessionalStatus(status: any): ProfessionalStatus {
  return (status === 'active' || status === 'pending' || status === 'inactive') 
    ? status as ProfessionalStatus 
    : 'pending';
}