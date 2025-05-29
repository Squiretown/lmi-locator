
// This file is maintained for backward compatibility
// It uses the new professionals API internally
import { Professional, ProfessionalFormValues, fetchProfessionals, createProfessional, updateProfessional, deleteProfessional, getProfessionalByUserId } from './professionals';

export interface Realtor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  brokerage: string;
  license_number: string;
  status: 'active' | 'pending' | 'inactive';
  website: string | null;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  user_id?: string | null;
  // Optional additional fields
  is_flagged?: boolean | null;
  notes?: string | null;
  social_media?: any;
  last_updated?: string;
}

export interface RealtorFormValues {
  name: string;
  email: string;
  phone?: string;
  brokerage: string;
  license_number: string;
  status: 'active' | 'pending' | 'inactive';
  website?: string;
  bio?: string;
  photo_url?: string;
}

// Transform Professional to Realtor interface
const transformToRealtor = (professional: Professional): Realtor => ({
  id: professional.id,
  name: professional.name,
  email: '', // Email is not stored in professionals table
  phone: professional.phone,
  brokerage: professional.company,
  license_number: professional.licenseNumber,
  status: professional.status,
  website: professional.website,
  bio: professional.bio,
  photo_url: professional.photoUrl,
  created_at: professional.createdAt,
  user_id: professional.userId,
  is_flagged: professional.isFlagged,
  notes: professional.notes,
  social_media: professional.socialMedia,
  last_updated: professional.lastUpdated
});

// Transform RealtorFormValues to ProfessionalFormValues
const transformToProfessionalForm = (realtor: RealtorFormValues): ProfessionalFormValues => ({
  type: 'realtor',
  name: realtor.name,
  company: realtor.brokerage,
  licenseNumber: realtor.license_number,
  phone: realtor.phone,
  website: realtor.website,
  bio: realtor.bio,
  photoUrl: realtor.photo_url,
  status: realtor.status
});

export const fetchRealtors = async (): Promise<Realtor[]> => {
  try {
    console.log('Fetching realtors...');
    const professionals = await fetchProfessionals('realtor');
    console.log('Fetched professionals:', professionals.length);
    return professionals.map(transformToRealtor);
  } catch (error) {
    console.error('Error in fetchRealtors:', error);
    throw error;
  }
};

export const createRealtor = async (realtor: RealtorFormValues): Promise<Realtor> => {
  try {
    console.log('Creating realtor:', realtor);
    const professionalForm = transformToProfessionalForm(realtor);
    const professional = await createProfessional(professionalForm);
    console.log('Created professional:', professional);
    return transformToRealtor(professional);
  } catch (error) {
    console.error('Error in createRealtor:', error);
    throw error;
  }
};

export const updateRealtor = async (id: string, realtor: RealtorFormValues): Promise<Realtor> => {
  try {
    console.log('Updating realtor:', id, realtor);
    const professionalForm = transformToProfessionalForm(realtor);
    const professional = await updateProfessional(id, professionalForm);
    console.log('Updated professional:', professional);
    return transformToRealtor(professional);
  } catch (error) {
    console.error('Error in updateRealtor:', error);
    throw error;
  }
};

export const deleteRealtor = async (id: string): Promise<void> => {
  try {
    console.log('Deleting realtor with ID:', id);
    await deleteProfessional(id);
    console.log('Successfully deleted realtor:', id);
  } catch (error) {
    console.error('Error in deleteRealtor:', error);
    throw error;
  }
};

export const getRealtorByUserId = async (): Promise<Realtor | null> => {
  try {
    const professional = await getProfessionalByUserId('realtor');
    if (!professional) return null;
    return transformToRealtor(professional);
  } catch (error) {
    console.error('Error in getRealtorByUserId:', error);
    return null;
  }
};
