
import { supabase } from '@/integrations/supabase/client';
import { BrokerFormValues, MortgageBroker } from '../types';

export const createBroker = async (broker: BrokerFormValues): Promise<MortgageBroker> => {
  const { data, error } = await supabase
    .from('mortgage_brokers')
    .insert([broker])
    .select()
    .single();

  if (error) {
    console.error('Error creating broker:', error);
    throw new Error(`Failed to create broker: ${error.message}`);
  }

  return data;
};

export const updateBroker = async (id: string, broker: BrokerFormValues): Promise<MortgageBroker> => {
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

  return data;
};

export const deleteBroker = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('mortgage_brokers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting broker:', error);
    throw new Error(`Failed to delete broker: ${error.message}`);
  }
};
