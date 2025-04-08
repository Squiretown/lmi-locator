import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if current user has a specific permission
 * @param permission The permission to check
 * @returns Boolean indicating if user has permission
 */
export async function checkUserPermission(permission: string): Promise<boolean> {
  try {
    // Use the user_has_permission database function
    const { data, error } = await supabase.functions.invoke('user-has-permission', {
      body: { permission }
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
    
    // First try to get user type from metadata (most reliable source)
    if (user.user_metadata?.user_type) {
      return user.user_metadata.user_type as string;
    }
    
    // First check if user is admin - this is a special case
    try {
      const { data: isAdmin } = await supabase.rpc('user_is_admin');
      if (isAdmin) return 'admin';
    } catch (error) {
      console.warn('Error checking admin status:', error);
    }
    
    // Otherwise try to fetch the user type from their profile
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) {
        console.error('Error fetching user profile:', error);
        return user.user_metadata?.user_type as string || null;
      }
      
      // We need to get the type name through a separate query
      try {
        const { data: typeData, error: typeError } = await supabase.functions.invoke('get-user-type-name', {
          body: { profileId: data.id }
        });
        
        if (typeError) {
          console.error('Error fetching user type:', typeError);
          return user.user_metadata?.user_type as string || null;
        }
        
        return typeData?.type_name || user.user_metadata?.user_type as string || 'client';
      } catch (innerError) {
        console.error('Exception in type name fetch:', innerError);
        return user.user_metadata?.user_type as string || null;
      }
    } catch (profileError) {
      console.error('Exception in profile fetch:', profileError);
      return user.user_metadata?.user_type as string || null;
    }
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
    
    // First check if user is admin - gets all permissions
    const { data: isAdmin } = await supabase.rpc('user_is_admin');
    if (isAdmin) {
      // Return all possible permissions for admin
      const { data } = await supabase.functions.invoke('get-all-permissions');
      return data && Array.isArray(data) ? data.map((p: any) => p.permission_name) : [];
    }
    
    // Otherwise get the user's specific permissions
    const { data } = await supabase.functions.invoke('get-user-permissions', {
      body: { userId: user.id }
    });
    
    if (!data) {
      return [];
    }
    
    return Array.isArray(data) ? data.map((p: any) => p.permission_name) : [];
  } catch (error) {
    console.error('Exception in getUserPermissions:', error);
    return [];
  }
}
