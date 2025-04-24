
import { Professional, ProfessionalType, ProfessionalStatus } from '../types/modelTypes';
import { supabaseUntyped } from '../utils/supabaseUntyped';

/**
 * Get professionals assigned to a user
 */
export async function getProfessionalForUser(userId: string): Promise<Professional[]> {
  try {
    // Get client profile without type inference
    const clientProfileResult = await supabaseUntyped.getClientProfile(userId);
    
    if (clientProfileResult.error || !clientProfileResult.data?.professional_id) {
      return [];
    }
    
    const professionalId = clientProfileResult.data.professional_id;
    
    // Get professional details without type inference
    const professionalsResult = await supabaseUntyped.getProfessional(professionalId);
    
    if (professionalsResult.error || !professionalsResult.data?.length) {
      return [];
    }
    
    // Convert raw data to Professional objects
    return professionalsResult.data.map(createProfessionalModel);
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
