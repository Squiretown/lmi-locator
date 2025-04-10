
import { supabase } from '@/integrations/supabase/client';
import { RealtorTable, RealtorPermissionTable } from './database-types';

export interface Realtor {
  id: string;
  name: string;
  brokerage: string;
  license_number: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
  last_updated: string;
  is_flagged: boolean;
  notes: string | null;
  social_media: Record<string, string> | null;
}

export interface RealtorFormValues {
  name: string;
  brokerage: string;
  license_number?: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  is_flagged?: boolean;
  notes?: string;
}

export const fetchRealtors = async (): Promise<Realtor[]> => {
  // Using type assertion since the table might not be in Supabase types
  const { data, error } = await supabase
    .from('realtors')
    .select('*')
    .order('created_at', { ascending: false }) as unknown as { 
      data: RealtorTable[] | null; 
      error: Error | null 
    };

  if (error) {
    console.error('Error fetching realtors:', error);
    throw new Error(`Failed to fetch realtors: ${error.message}`);
  }

  return (data || []) as unknown as Realtor[];
};

export const createRealtor = async (realtor: RealtorFormValues): Promise<Realtor> => {
  // Ensure all required fields are present
  const realtorData = {
    name: realtor.name,
    brokerage: realtor.brokerage,
    license_number: realtor.license_number || null,
    email: realtor.email || null,
    phone: realtor.phone || null,
    website: realtor.website || null,
    bio: realtor.bio || null,
    is_flagged: realtor.is_flagged || false,
    notes: realtor.notes || null
  };

  // Using type assertion since the table might not be in Supabase types
  const { data, error } = await supabase
    .from('realtors')
    .insert([realtorData])
    .select()
    .single() as unknown as { 
      data: RealtorTable | null; 
      error: Error | null 
    };

  if (error) {
    console.error('Error creating realtor:', error);
    throw new Error(`Failed to create realtor: ${error.message}`);
  }

  return data as unknown as Realtor;
};

export const updateRealtor = async (id: string, realtor: RealtorFormValues): Promise<Realtor> => {
  // Ensure all required fields are present
  const realtorData = {
    name: realtor.name,
    brokerage: realtor.brokerage,
    license_number: realtor.license_number || null,
    email: realtor.email || null,
    phone: realtor.phone || null,
    website: realtor.website || null,
    bio: realtor.bio || null,
    is_flagged: realtor.is_flagged || false,
    notes: realtor.notes || null
  };

  // Using type assertion since the table might not be in Supabase types
  const { data, error } = await supabase
    .from('realtors')
    .update(realtorData)
    .eq('id', id)
    .select()
    .single() as unknown as { 
      data: RealtorTable | null; 
      error: Error | null 
    };

  if (error) {
    console.error('Error updating realtor:', error);
    throw new Error(`Failed to update realtor: ${error.message}`);
  }

  return data as unknown as Realtor;
};

export const deleteRealtor = async (id: string): Promise<void> => {
  // Using type assertion since the table might not be in Supabase types
  const { error } = await supabase
    .from('realtors')
    .delete()
    .eq('id', id) as unknown as { 
      error: Error | null 
    };

  if (error) {
    console.error('Error deleting realtor:', error);
    throw new Error(`Failed to delete realtor: ${error.message}`);
  }
};

export const getRealtorPermissions = async (realtorId: string): Promise<string[]> => {
  // Using type assertion since the table might not be in Supabase types
  const { data, error } = await supabase
    .from('realtor_permissions')
    .select('permission_name')
    .eq('realtor_id', realtorId) as unknown as { 
      data: Pick<RealtorPermissionTable, 'permission_name'>[] | null; 
      error: Error | null 
    };

  if (error) {
    console.error('Error fetching realtor permissions:', error);
    throw new Error(`Failed to fetch realtor permissions: ${error.message}`);
  }

  return (data || []).map(item => item.permission_name as string);
};
