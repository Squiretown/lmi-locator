
import { supabase } from '@/integrations/supabase/client';
import { MortgageBroker } from '../types';

export const fetchBrokers = async (): Promise<MortgageBroker[]> => {
  const { data, error } = await supabase
    .from('mortgage_brokers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brokers:', error);
    throw new Error(`Failed to fetch brokers: ${error.message}`);
  }

  return (data || []).map(broker => ({
    id: broker.id,
    name: broker.name,
    company: broker.company,
    license_number: broker.license_number,
    email: broker.email,
    phone: broker.phone,
    status: broker.status as 'active' | 'pending' | 'inactive',
    created_at: broker.created_at
  }));
};

export const getBrokerPermissions = async (brokerId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('broker_permissions')
    .select('permission_name')
    .eq('broker_id', brokerId);

  if (error) {
    console.error('Error fetching broker permissions:', error);
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }

  return (data || []).map((permission) => permission.permission_name as string);
};
