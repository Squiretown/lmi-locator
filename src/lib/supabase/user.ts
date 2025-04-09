
import { supabase } from "@/integrations/supabase/client";
import { getTemporaryPermissions } from "./temporary-permissions";

/**
 * Checks if current user has a specific permission
 * @param permission The permission to check
 * @returns Boolean indicating if user has permission
 */
export async function checkUserPermission(permission: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Use edge function when database is fully set up
    // return await checkPermissionFromEdgeFunction(permission);
    
    // Temporary implementation
    const userType = user.user_metadata?.user_type as string || 'client';
    const permissions = getTemporaryPermissions(userType);
    return permissions.includes(permission) || userType === 'admin';
  } catch (error) {
    console.error('Exception checking permission:', error);
    return false;
  }
}

// This function will be used when the database is fully set up
async function checkPermissionFromEdgeFunction(permission: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('user-has-permission', {
      body: { permission }
    });
    
    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception calling edge function:', error);
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
    
    // First try to get user type from metadata (most reliable source)
    if (user.user_metadata?.user_type) {
      return user.user_metadata.user_type as string;
    }
    
    // For now, just return a default user type until we have the proper tables set up
    return 'client';
    
    // Once the database is set up, we'll use:
    /*
    // First check if user is admin - this is a special case
    try {
      const { data: isAdmin } = await supabase.rpc('user_is_admin');
      if (isAdmin) return 'admin';
    } catch (error) {
      console.warn('Error checking admin status:', error);
    }
    
    // Get user type using edge function
    try {
      const { data, error } = await supabase.functions.invoke('get-user-type-name', {
        body: {}
      });
      
      if (error) {
        console.error('Error fetching user type:', error);
        return user.user_metadata?.user_type as string || null;
      }
      
      return data?.type_name || user.user_metadata?.user_type as string || 'client';
    } catch (error) {
      console.error('Exception calling edge function:', error);
      return user.user_metadata?.user_type as string || null;
    }
    */
  } catch (error) {
    console.error('Exception in getUserTypeName:', error);
    
    // As a last resort, try to get the metadata directly
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.user_type) {
        return user.user_metadata.user_type as string;
      }
    } catch (e) {
      console.error('Failed to get user metadata as fallback:', e);
    }
    
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
    
    // Temporary implementation
    const userType = user.user_metadata?.user_type as string || 'client';
    return getTemporaryPermissions(userType);
    
    // Once the database is fully set up, we'll use:
    /*
    // Check if user is admin - gets all permissions
    const { data: isAdmin } = await supabase.rpc('user_is_admin');
    if (isAdmin) {
      // Return all possible permissions for admin
      const { data } = await supabase.functions.invoke('get-all-permissions');
      return data && Array.isArray(data) ? data.map((p: any) => p.permission_name) : [];
    }
    
    // Get user permissions via edge function
    const { data } = await supabase.functions.invoke('get-user-permissions', {
      body: { userId: user.id }
    });
    
    if (!data) {
      return [];
    }
    
    return Array.isArray(data) ? data.map((p: any) => p.permission_name) : [];
    */
  } catch (error) {
    console.error('Exception in getUserPermissions:', error);
    return [];
  }
}
