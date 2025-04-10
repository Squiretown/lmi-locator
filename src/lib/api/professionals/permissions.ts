
import { supabase } from '@/integrations/supabase/client';

export const getPermissionsForProfessional = async (professionalId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('professional_permissions')
    .select('permission_name')
    .eq('professional_id', professionalId);

  if (error) {
    console.error('Error fetching professional permissions:', error);
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }

  return (data || []).map((permission) => permission.permission_name as string);
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
