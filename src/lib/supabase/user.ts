import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if current user has a specific permission
 * @param permission The permission to check
 * @returns Boolean indicating if user has permission
 */
export async function checkUserPermission(permission: string): Promise<boolean> {
  try {
    // Use the user_has_permission database function
    const { data, error } = await supabase.rpc('user_has_permission', {
      required_permission: permission
    });
    
    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception checking permission:', error);
    return false;
  }
}

/**
 * Gets current user's user type name
 * @returns The user's type name or null
 */
export async function getUserTypeName(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // First check if user is admin - this is a special case
    const { data: isAdmin } = await supabase.rpc('user_is_admin');
    if (isAdmin) return 'admin';
    
    // Otherwise fetch the user type from their profile
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    // We need to get the type name through a separate query
    // since the typed client doesn't know about user_type_id yet
    const { data: typeData, error: typeError } = await supabase
      .rpc('get_user_type_name', { profile_id: data.id });
    
    if (typeError) {
      console.error('Error fetching user type:', typeError);
      return null;
    }
    
    return typeData?.type_name || 'client';
  } catch (error) {
    console.error('Exception in getUserTypeName:', error);
    return null;
  }
}

/**
 * Gets all permissions for the current user
 * @returns Array of permission names
 */
export async function getUserPermissions(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    // First check if user is admin - gets all permissions
    const { data: isAdmin } = await supabase.rpc('user_is_admin');
    if (isAdmin) {
      // Return all possible permissions for admin
      const { data } = await supabase
        .rpc('get_all_permissions');
      return data?.map((p: any) => p.permission_name) || [];
    }
    
    // Otherwise get the user's specific permissions
    const { data, error } = await supabase
      .rpc('get_user_permissions', { user_uuid: user.id });
    
    if (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
    
    return data?.map((p: any) => p.permission_name) || [];
  } catch (error) {
    console.error('Exception in getUserPermissions:', error);
    return [];
  }
}
