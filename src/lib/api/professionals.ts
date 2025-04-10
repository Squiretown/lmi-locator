
import { supabase } from '@/integrations/supabase/client';
import { ProfessionalTable, ProfessionalPermissionTable } from './database-types';

export interface Professional {
  id: string;
  userId: string;
  type: 'realtor' | 'mortgage_broker';
  name: string;
  company: string;
  licenseNumber: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  bio: string | null;
  photoUrl: string | null;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  lastUpdated: string;
  // Optional additional fields
  isVerified?: boolean | null;
  isFlagged?: boolean | null;
  notes?: string | null;
  socialMedia?: any;
}

export interface ProfessionalFormValues {
  name: string;
  type: 'realtor' | 'mortgage_broker';
  company: string;
  licenseNumber: string;
  phone?: string;
  address?: string;
  website?: string;
  bio?: string;
  photoUrl?: string;
  status: 'active' | 'pending' | 'inactive';
}

// Transform database object to Professional interface
const transformProfessional = (item: ProfessionalTable): Professional => ({
  id: item.id,
  userId: item.user_id,
  type: item.type,
  name: item.name,
  company: item.company,
  licenseNumber: item.license_number,
  phone: item.phone,
  address: item.address || null,
  website: item.website,
  bio: item.bio,
  photoUrl: item.photo_url,
  status: item.status || 'pending',
  createdAt: item.created_at,
  lastUpdated: item.last_updated,
  isVerified: item.is_verified,
  isFlagged: item.is_flagged,
  notes: item.notes,
  socialMedia: item.social_media
});

export const fetchProfessionals = async (type?: 'realtor' | 'mortgage_broker'): Promise<Professional[]> => {
  let query = supabase
    .from('professionals')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching professionals:', error);
    throw new Error(`Failed to fetch professionals: ${error.message}`);
  }

  const professionals = (data || []).map((item: ProfessionalTable) => transformProfessional(item));
  return professionals;
};

export const fetchProfessionalById = async (id: string): Promise<Professional | null> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No record found, return null
      return null;
    }
    console.error('Error fetching professional:', error);
    throw new Error(`Failed to fetch professional: ${error.message}`);
  }

  return transformProfessional(data as ProfessionalTable);
};

export const createProfessional = async (professional: ProfessionalFormValues): Promise<Professional> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      throw new Error(`Authentication required: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('User must be authenticated to create professional profiles');
    }

    // Prepare the professional data
    const professionalData = {
      user_id: user.id,
      type: professional.type,
      name: professional.name,
      company: professional.company,
      license_number: professional.licenseNumber,
      phone: professional.phone || null,
      address: professional.address || null,
      website: professional.website || null,
      bio: professional.bio || null,
      photo_url: professional.photoUrl || null,
      status: professional.status
    };

    const { data, error } = await supabase
      .from('professionals')
      .insert([professionalData])
      .select()
      .single();

    if (error) {
      console.error('Error creating professional:', error);
      throw new Error(`Failed to create professional: ${error.message}`);
    }

    return transformProfessional(data as ProfessionalTable);
  } catch (err) {
    console.error('Error in createProfessional:', err);
    throw err;
  }
};

export const updateProfessional = async (id: string, professional: ProfessionalFormValues): Promise<Professional> => {
  // Prepare the professional data
  const professionalData = {
    name: professional.name,
    company: professional.company,
    license_number: professional.licenseNumber,
    phone: professional.phone || null,
    address: professional.address || null,
    website: professional.website || null,
    bio: professional.bio || null,
    photo_url: professional.photoUrl || null,
    status: professional.status
  };

  const { data, error } = await supabase
    .from('professionals')
    .update(professionalData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating professional:', error);
    throw new Error(`Failed to update professional: ${error.message}`);
  }

  return transformProfessional(data as ProfessionalTable);
};

export const deleteProfessional = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting professional:', error);
    throw new Error(`Failed to delete professional: ${error.message}`);
  }
};

export const getProfessionalByUserId = async (type?: 'realtor' | 'mortgage_broker'): Promise<Professional | null> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return null;
    }

    let query = supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id);
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found, return null
        return null;
      }
      console.error('Error fetching professional:', error);
      throw new Error(`Failed to fetch professional: ${error.message}`);
    }

    return transformProfessional(data as ProfessionalTable);
  } catch (err) {
    console.error('Error in getProfessionalByUserId:', err);
    return null;
  }
};

// Functions for professional permissions
export const getPermissionsForProfessional = async (professionalId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('professional_permissions')
    .select('permission_name')
    .eq('professional_id', professionalId);

  if (error) {
    console.error('Error fetching professional permissions:', error);
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }

  return (data || []).map((permission: ProfessionalPermissionTable) => permission.permission_name);
};

export const addPermissionToProfessional = async (professionalId: string, permissionName: string): Promise<void> => {
  const { error } = await supabase
    .from('professional_permissions')
    .insert([{ professional_id: professionalId, permission_name: permissionName }]);

  if (error) {
    console.error('Error adding permission:', error);
    throw new Error(`Failed to add permission: ${error.message}`);
  }
};

export const removePermissionFromProfessional = async (professionalId: string, permissionName: string): Promise<void> => {
  const { error } = await supabase
    .from('professional_permissions')
    .delete()
    .eq('professional_id', professionalId)
    .eq('permission_name', permissionName);

  if (error) {
    console.error('Error removing permission:', error);
    throw new Error(`Failed to remove permission: ${error.message}`);
  }
};
