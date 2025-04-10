
import { supabase } from '@/integrations/supabase/client';
import { BrokerFormValues } from '@/components/brokers/BrokerForm';

export interface MortgageBroker {
  id: string;
  name: string;
  company: string;
  license_number: string;
  email: string;
  phone: string | null;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

export const fetchBrokers = async (): Promise<MortgageBroker[]> => {
  const { data, error } = await supabase
    .from('mortgage_brokers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brokers:', error);
    throw new Error(`Failed to fetch brokers: ${error.message}`);
  }

  return data || [];
};

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

export const getBrokerPermissions = async (brokerId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('broker_permissions')
    .select('permission_name')
    .eq('broker_id', brokerId);

  if (error) {
    console.error('Error fetching broker permissions:', error);
    throw new Error(`Failed to fetch broker permissions: ${error.message}`);
  }

  return data?.map(item => item.permission_name) || [];
};
