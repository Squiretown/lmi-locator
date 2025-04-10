
import { supabase } from '@/integrations/supabase/client';
import { RealtorTable } from './database-types';

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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching realtors:', error);
    throw new Error(`Failed to fetch realtors: ${error.message}`);
  }

  return (data || []) as Realtor[];
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

  const { data, error } = await supabase
    .from('realtors')
    .insert([realtorData])
    .select()
    .single();

  if (error) {
    console.error('Error creating realtor:', error);
    throw new Error(`Failed to create realtor: ${error.message}`);
  }

  return data as Realtor;
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

  const { data, error } = await supabase
    .from('realtors')
    .update(realtorData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating realtor:', error);
    throw new Error(`Failed to update realtor: ${error.message}`);
  }

  return data as Realtor;
};

export const deleteRealtor = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('realtors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting realtor:', error);
    throw new Error(`Failed to delete realtor: ${error.message}`);
  }
};

export const getRealtorPermissions = async (realtorId: string): Promise<string[]> => {
  // For now, we're using the broker_permissions table since we don't have a realtor_permissions table yet
  const { data, error } = await supabase
    .from('broker_permissions')
    .select('permission_name')
    .eq('broker_id', realtorId);

  if (error) {
    console.error('Error fetching realtor permissions:', error);
    throw new Error(`Failed to fetch realtor permissions: ${error.message}`);
  }

  return (data || []).map(item => item.permission_name as string);
};
