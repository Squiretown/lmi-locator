
import { supabase } from '@/integrations/supabase/client';
import { ProfessionalTable } from '../database-types';
import { Professional } from '../types';
import { transformProfessional } from '../utils/transformers';

export const fetchProfessionals = async (type?: 'realtor' | 'mortgage_broker'): Promise<Professional[]> => {
  let query = supabase.from('professionals').select();
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching professionals:', error);
    throw new Error(`Failed to fetch professionals: ${error.message}`);
  }

  return (data || []).map((item) => transformProfessional(item as ProfessionalTable));
};

export const fetchProfessionalById = async (id: string): Promise<Professional | null> => {
  const { data, error } = await supabase
    .from('professionals')
    .select()
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

export const getProfessionalByUserId = async (type?: 'realtor' | 'mortgage_broker'): Promise<Professional | null> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return null;
    }

    let query = supabase.from('professionals').select();
    
    // Apply filters
    query = query.eq('user_id', user.id);
    
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
