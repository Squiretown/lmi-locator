import { supabase } from "@/integrations/supabase/client";

/**
 * Get the current user's permissions
 * @returns Array of permission names
 */
export async function getCurrentUserPermissions(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    // First check if user is admin - gets all permissions
    const { data: isAdmin } = await supabase.rpc('user_is_admin');
    if (isAdmin) {
      const { data } = await supabase.functions.invoke('get-all-permissions');
      return data && Array.isArray(data) ? data.map((p: any) => p.permission_name) : [];
    }
    
    // Otherwise get the user's specific permissions
    const { data } = await supabase.functions.invoke('get-user-permissions', {
      body: { userId: user.id }
    });
    
    return data && Array.isArray(data) ? data.map((p: any) => p.permission_name) : [];
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
