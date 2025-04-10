
import { supabase } from '@/integrations/supabase/client';
import { BrokerFormValues, MortgageBroker } from '../types';

export const createBroker = async (broker: BrokerFormValues): Promise<MortgageBroker> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      throw new Error(`Authentication required: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('User must be authenticated to create broker profiles');
    }

    // Create the broker - Note: We're relying on the server-side RLS policies
    // or the user having the appropriate permissions
    const { data, error } = await supabase
      .from('mortgage_brokers')
      .insert([broker])
      .select()
      .single();

    if (error) {
      console.error('Error creating broker:', error);
      throw new Error(`Failed to create broker: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      company: data.company,
      license_number: data.license_number,
      email: data.email,
      phone: data.phone,
      status: data.status as 'active' | 'pending' | 'inactive',
      created_at: data.created_at
    };
  } catch (err) {
    console.error('Error in createBroker:', err);
    throw err;
  }
};

export const updateBroker = async (id: string, broker: BrokerFormValues): Promise<MortgageBroker> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required to update broker');
    }

    // Update the broker
    const { data, error } = await supabase
      .from('mortgage_brokers')
      .update(broker)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating broker:', error);
      throw new Error(`Failed to update broker: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      company: data.company,
      license_number: data.license_number,
      email: data.email,
      phone: data.phone,
      status: data.status as 'active' | 'pending' | 'inactive',
      created_at: data.created_at
    };
  } catch (err) {
    console.error('Error in updateBroker:', err);
    throw err;
  }
};

export const deleteBroker = async (id: string): Promise<void> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required to delete broker');
    }

    const { error } = await supabase
      .from('mortgage_brokers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting broker:', error);
      throw new Error(`Failed to delete broker: ${error.message}`);
    }
  } catch (err) {
    console.error('Error in deleteBroker:', err);
    throw err;
  }
};
