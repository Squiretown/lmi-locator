
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
      
      // Get current session to check if user is admin
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Check if current user is admin
      const userType = session.user?.user_metadata?.user_type;
      if (userType !== 'admin') {
        throw new Error('Admin privileges required to view users');
      }

      // Use the admin listUsers function via edge function
      const { data: authData, error: authError } = await supabase.functions.invoke('list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

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

  const handleResetPassword = async (userId: string) => {
    try {
      toast.info('Password reset functionality needs to be implemented');
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      toast.error(errorMessage);
    }
  };

  const handleDisableUser = async (userId: string) => {
    try {
      console.log('Attempting to delete user profile only:', userId);
      
      // Delete from user_profiles table only (soft delete)
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('User profile removed successfully');
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error removing user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user profile';
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('Attempting to completely delete user from auth:', userId);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Call the delete-user edge function
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error occurred');
      }

      toast.success('User deleted successfully from authentication system');
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    handleResetPassword,
    handleDisableUser,
    handleDeleteUser,
    refetch: fetchUsers
  };
};
