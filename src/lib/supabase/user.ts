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
    
    // Use temporary implementation based on user metadata
    const userType = user.user_metadata?.user_type as string || 'client';
    const permissions = getTemporaryPermissions(userType);
    return permissions.includes(permission) || userType === 'admin';
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
    
    // Get user type from metadata (most reliable source)
    if (user.user_metadata?.user_type) {
      return user.user_metadata.user_type as string;
    }
    
    // Default fallback
    return 'client';
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
    
    // Use temporary implementation based on user type
    const userType = user.user_metadata?.user_type as string || 'client';
    return getTemporaryPermissions(userType);
  } catch (error) {
    console.error('Exception in getUserPermissions:', error);
    return [];
  }
}
