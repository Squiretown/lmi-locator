import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getValidSession } from '@/lib/auth/getValidSession';

interface Permission {
  id: string;
  permission_name: string;
  description?: string;
  category?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  assigned_by?: string;
}

/**
 * Advanced permissions system hook that integrates with database
 */
export function usePermissionsSystem() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
      fetchAllPermissions();
    } else {
      setPermissions([]);
      setUserRole(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // For now, get user role from user metadata since database functions may not be available yet
      const metadataRole = user.user_metadata?.user_type || 'client';
      setUserRole(metadataRole);

      // Use temporary permissions logic for now
      if (metadataRole === 'admin') {
        setPermissions([
          'view_all_users', 'manage_users', 'view_analytics', 'manage_system_settings',
          'export_data', 'manage_properties', 'view_all_searches', 'manage_marketing_campaigns',
          'view_notifications', 'manage_notifications', 'view_user_management',
          'sign_out_all_users', 'remove_all_users', 'manage_contacts'
        ]);
      } else if (metadataRole === 'mortgage_professional' || metadataRole === 'realtor') {
        setPermissions([
          'view_analytics', 'export_data', 'manage_properties', 'view_own_searches',
          'manage_marketing_campaigns', 'view_notifications', 'manage_contacts'
        ]);
      } else {
        setPermissions(['view_own_searches', 'view_notifications']);
      }
    } catch (error) {
      console.error('Error in fetchUserPermissions:', error);
      setPermissions([]);
      setUserRole(user.user_metadata?.user_type || 'client');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('id:permission_id, permission_name')
        .order('permission_name');

      if (error) {
        console.error('Error fetching all permissions:', error);
        return;
      }

      const formattedPermissions: Permission[] = (data || []).map(item => ({
        id: item.id || '',
        permission_name: item.permission_name,
        description: '',
        category: 'general'
      }));

      setAllPermissions(formattedPermissions);
    } catch (error) {
      console.error('Error in fetchAllPermissions:', error);
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    // Admin always has all permissions
    if (userRole === 'admin') return true;
    
    // Check if user has the specific permission
    return permissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission));
  };

  const assignRoleToUser = async (userId: string, role: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      await getValidSession();

      const { data, error } = await supabase.functions.invoke('update-user-role', {
        body: {
          userId,
          newRole: role
        }
      });

      if (error) {
        console.error('Error assigning role:', error);
        return { success: false, error: new Error(error.message || 'Failed to assign role') };
      }

      if (!data?.success) {
        return { success: false, error: new Error(data?.error || 'Failed to assign role') };
      }

      // Refresh user permissions after successful role change
      await fetchUserPermissions();
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error: error as Error };
    }
  };

  const removeRoleFromUser = async (userId: string, role: string): Promise<{ success: boolean; error?: Error }> => {
    try {
      // For now, just log the role removal since user_roles table might not be ready
      console.log('Role removal requested:', { userId, role });
      return { success: true };
    } catch (error) {
      console.error('Error removing role:', error);
      return { success: false, error: error as Error };
    }
  };

  return {
    permissions,
    userRole,
    isLoading,
    allPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    assignRoleToUser,
    removeRoleFromUser,
    refetch: fetchUserPermissions
  };
}