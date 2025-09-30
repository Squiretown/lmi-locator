import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getValidSession } from '@/lib/auth/getValidSession';
import type { AdminUser } from '../types/admin-user';

export const useUserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching auth users via admin API...');
      
      // Check current user and admin privileges
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const error = new Error('No active session found');
        throw error;
      }

      // Check if current user is admin
      const userType = user.user_metadata?.user_type;
      if (userType !== 'admin') {
        const error = new Error('Admin privileges required to view users');
        throw error;
      }

      // Ensure fresh session before invoking edge function
      await getValidSession();

      // Use the admin listUsers function via edge function
      const { data: authData, error: authError } = await supabase.functions.invoke('list-users');

      if (authError) {
        console.error('Failed to fetch auth users:', authError);
        throw new Error(`Failed to fetch users: ${authError.message}`);
      }

      console.log('Successfully fetched auth users:', authData?.users?.length || 0);
      
      // Transform auth users to AdminUser format
      const transformedUsers: AdminUser[] = (authData?.users || []).map((authUser: any) => ({
        id: authUser.id,
        email: authUser.email || 'No email',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        user_metadata: authUser.user_metadata || {},
        app_metadata: authUser.app_metadata || {}
      }));
      
      setUsers(transformedUsers);

    } catch (err) {
      console.error('Error in fetchUsers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
};