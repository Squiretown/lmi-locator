import { supabase } from "@/integrations/supabase/client";
import { getTemporaryPermissions } from "./temporary-permissions";

/**
 * Get the current user's permissions
 * Uses temporary implementation based on user metadata
 * @returns Array of permission names
 */
export async function getCurrentUserPermissions(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    // Use temporary implementation based on user type from metadata
    const userType = user.user_metadata?.user_type as string || 'client';
    
    // Check if user is admin
    if (userType === 'admin') {
      // Return all possible permissions for admin
      return [
        'admin_access',
        'user_management',
        'data_export',
        'system_logs',
        'view_clients',
        'manage_clients',
        'view_team',
        'manage_team',
        'view_properties',
        'manage_properties',
        'view_reports',
        'manage_reports'
      ];
    }
    
    // Return permissions based on user type
    return getTemporaryPermissions(userType);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

/**
 * Check if the current user has a specific permission
 * @param permission The permission to check
 * @returns Boolean indicating if user has permission
 */
export async function checkUserPermission(permission: string): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  return permissions.includes(permission);
}
