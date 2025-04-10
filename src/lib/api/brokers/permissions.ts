
import { supabase } from '@/integrations/supabase/client';

export const addPermissionToBroker = async (brokerId: string, permissionName: string): Promise<void> => {
  const { error } = await supabase
    .from('broker_permissions')
    .insert([{ broker_id: brokerId, permission_name: permissionName }]);

  if (error) {
    console.error('Error adding permission:', error);
    throw new Error(`Failed to add permission: ${error.message}`);
  }
};

export const removePermissionFromBroker = async (brokerId: string, permissionName: string): Promise<void> => {
  const { error } = await supabase
    .from('broker_permissions')
    .delete()
    .eq('broker_id', brokerId)
    .eq('permission_name', permissionName);

  if (error) {
    console.error('Error removing permission:', error);
    throw new Error(`Failed to remove permission: ${error.message}`);
  }
};
