
import { supabase } from '@/integrations/supabase/client';
import { DbClientProfile, DbProfessional } from '../types/databaseTypes';
import { Professional, ProfessionalType, ProfessionalStatus } from '../types/modelTypes';

/**
 * Get professionals assigned to a user
 */
export async function getProfessionalForUser(userId: string): Promise<Professional[]> {
  try {
    // Step 1: Get professional ID from client profile
    const { data: clientProfile, error: profileError } = await supabase
      .from('client_profiles')
      .select('professional_id')
      .eq('user_id', userId)
      .single();
    
    if (profileError || !clientProfile?.professional_id) {
      if (profileError) console.error('Error fetching client profile:', profileError);
      return [];
    }

    // Step 2: Get professional details
    const { data: professionals, error: profError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', clientProfile.professional_id);
    
    if (profError || !professionals?.length) {
      console.error('Error fetching professionals:', profError);
      return [];
    }

    // Step 3: Map to application models
    return professionals.map(mapDbProfessionalToModel);
  } catch (err) {
    console.error('Unexpected error in getProfessionalForUser:', err);
    return [];
  }
}

/**
 * Map database professional record to application model
 */
function mapDbProfessionalToModel(dbProf: DbProfessional): Professional {
  // Determine professional type
  const type: ProfessionalType = 
    (dbProf.type === 'realtor' || dbProf.type === 'mortgage_broker') 
      ? dbProf.type 
      : 'realtor';

  // Determine status
  const status: ProfessionalStatus = 
    (dbProf.status === 'active' || dbProf.status === 'pending' || dbProf.status === 'inactive')
      ? dbProf.status as ProfessionalStatus
      : 'pending';

  // Map DB model to application model with proper null handling
  return {
    id: dbProf.id,
    userId: dbProf.user_id,
    type,
    name: dbProf.name || '',
    company: dbProf.company || '',
    licenseNumber: dbProf.license_number || '',
    phone: dbProf.phone,
    address: dbProf.address,
    website: dbProf.website,
    bio: dbProf.bio,
    photoUrl: dbProf.photo_url,
    status,
    createdAt: dbProf.created_at,
    lastUpdated: dbProf.last_updated || dbProf.created_at,
    isVerified: !!dbProf.is_verified,
    isFlagged: !!dbProf.is_flagged,
    notes: dbProf.notes,
    socialMedia: dbProf.social_media
  };
}
