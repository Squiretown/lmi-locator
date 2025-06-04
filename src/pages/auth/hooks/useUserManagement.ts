
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
      
      console.log('Fetching user profiles with fixed RLS policies...');
      
      // Fetch user profiles - the fixed RLS policies should now work correctly
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('user_type');

      if (profilesError) {
        console.error('Failed to fetch user profiles:', profilesError);
        throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
      }

      console.log('Successfully fetched user profiles:', profiles?.length || 0);
      
      // Transform profiles to AdminUser format
      const transformedUsers: AdminUser[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        email: profile.company_name || 'No email available',
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        user_metadata: {
          user_type: profile.user_type || 'client',
          first_name: profile.company_name ? profile.company_name.split(' ')[0] : undefined,
          last_name: profile.company_name ? profile.company_name.split(' ').slice(1).join(' ') : undefined,
        },
        app_metadata: {
          provider: 'email',
          providers: ['email']
        }
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
      console.log('Attempting to delete user profile:', userId);
      
      // Delete from user_profiles table
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('User profile deleted successfully');
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user profile';
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('Attempting to completely remove user:', userId);
      
      // Delete from user_profiles table first
      const { error: profileDeleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileDeleteError) {
        throw profileDeleteError;
      }

      toast.success('User removed successfully');
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error removing user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user';
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
