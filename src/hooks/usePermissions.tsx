
import { useState, useEffect } from 'react';
import { checkUserPermission } from '@/lib/supabase/permissions';

/**
 * Hook to check for multiple permissions at once
 * @param permissionNames Array of permission names to check
 * @returns Object with permission names as keys and boolean values
 */
export function usePermissions(permissionNames: string[]) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      setIsLoading(true);
      try {
        const permissionResults = await Promise.all(
          permissionNames.map(async (permission) => {
            const hasPermission = await checkUserPermission(permission);
            return [permission, hasPermission];
          })
        );
        
        const permissionObject = Object.fromEntries(permissionResults);
        setPermissions(permissionObject);
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (permissionNames.length > 0) {
      checkPermissions();
    } else {
      setIsLoading(false);
    }
  }, [permissionNames]);

  return { permissions, isLoading };
}
