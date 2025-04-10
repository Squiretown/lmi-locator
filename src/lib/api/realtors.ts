
import { supabase } from '@/integrations/supabase/client';
import { RealtorTable } from './database-types';

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
  user_id?: string;
  // Optional additional fields
  is_flagged?: boolean;
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

export const fetchRealtors = async (): Promise<Realtor[]> => {
  const { data, error } = await supabase
    .from('realtors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching realtors:', error);
    throw new Error(`Failed to fetch realtors: ${error.message}`);
  }

  // Transform the data to match our Realtor interface
  const realtors = (data || []).map(item => {
    const realtor: Realtor = {
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      brokerage: item.brokerage,
      license_number: item.license_number,
      status: item.status || 'pending',
      website: item.website,
      bio: item.bio,
      photo_url: item.photo_url,
      created_at: item.created_at,
      user_id: item.user_id,
      is_flagged: item.is_flagged,
      notes: item.notes,
      social_media: item.social_media,
      last_updated: item.last_updated
    };
    return realtor;
  });

  return realtors;
};

export const createRealtor = async (realtor: RealtorFormValues): Promise<Realtor> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      throw new Error(`Authentication required: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('User must be authenticated to create realtors');
    }

    // Prepare the realtor data
    const realtorData = {
      name: realtor.name,
      email: realtor.email,
      phone: realtor.phone || null,
      brokerage: realtor.brokerage,
      license_number: realtor.license_number,
      status: realtor.status,
      website: realtor.website || null,
      bio: realtor.bio || null,
      photo_url: realtor.photo_url || null,
      user_id: user.id
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

    // Transform the response to match our Realtor interface
    const createdRealtor: Realtor = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      brokerage: data.brokerage,
      license_number: data.license_number,
      status: data.status,
      website: data.website,
      bio: data.bio,
      photo_url: data.photo_url,
      created_at: data.created_at,
      user_id: data.user_id,
      is_flagged: data.is_flagged,
      notes: data.notes,
      social_media: data.social_media,
      last_updated: data.last_updated
    };

    return createdRealtor;
  } catch (err) {
    console.error('Error in createRealtor:', err);
    throw err;
  }
};

export const updateRealtor = async (id: string, realtor: RealtorFormValues): Promise<Realtor> => {
  // Prepare the realtor data
  const realtorData = {
    name: realtor.name,
    email: realtor.email,
    phone: realtor.phone || null,
    brokerage: realtor.brokerage,
    license_number: realtor.license_number,
    status: realtor.status,
    website: realtor.website || null,
    bio: realtor.bio || null,
    photo_url: realtor.photo_url || null
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

  // Transform the response to match our Realtor interface
  const updatedRealtor: Realtor = {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    brokerage: data.brokerage,
    license_number: data.license_number,
    status: data.status,
    website: data.website,
    bio: data.bio,
    photo_url: data.photo_url,
    created_at: data.created_at,
    user_id: data.user_id,
    is_flagged: data.is_flagged,
    notes: data.notes,
    social_media: data.social_media,
    last_updated: data.last_updated
  };

  return updatedRealtor;
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

export const getRealtorByUserId = async (): Promise<Realtor | null> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('realtors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found, return null
        return null;
      }
      console.error('Error fetching realtor:', error);
      throw new Error(`Failed to fetch realtor: ${error.message}`);
    }

    // Transform the response to match our Realtor interface
    const realtor: Realtor = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      brokerage: data.brokerage,
      license_number: data.license_number,
      status: data.status || 'pending',
      website: data.website,
      bio: data.bio,
      photo_url: data.photo_url,
      created_at: data.created_at,
      user_id: data.user_id,
      is_flagged: data.is_flagged,
      notes: data.notes,
      social_media: data.social_media,
      last_updated: data.last_updated
    };

    return realtor;
  } catch (err) {
    console.error('Error in getRealtorByUserId:', err);
    return null;
  }
};
