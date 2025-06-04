
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
      
      console.log('Fetching users with admin privileges...');
      
      // Fetch all user profiles with their auth data
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('user_type');

      if (profilesError) {
        console.error('Failed to fetch user profiles:', profilesError);
        throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
      }

      console.log('Successfully fetched user profiles:', profiles?.length || 0);
      
      // Get auth user data for each profile
      const authUsers: AdminUser[] = [];
      
      if (profiles && profiles.length > 0) {
        // For each profile, try to get the corresponding auth user
        for (const profile of profiles) {
          try {
            // Get user from auth.users table using admin API
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);
            
            if (user && !userError) {
              authUsers.push({
                id: user.id,
                email: user.email,
                created_at: user.created_at,
                last_sign_in_at: user.last_sign_in_at,
                user_metadata: {
                  user_type: profile.user_type || user.user_metadata?.user_type || 'client',
                  first_name: user.user_metadata?.first_name,
                  last_name: user.user_metadata?.last_name,
                },
                app_metadata: {
                  provider: user.app_metadata?.provider || 'email',
                  providers: user.app_metadata?.providers || ['email']
                }
              });
            } else {
              console.warn('Could not fetch auth user for profile:', profile.user_id, userError);
              // Still add the profile data even if we can't get auth data
              authUsers.push({
                id: profile.user_id,
                email: 'Email not available',
                created_at: new Date().toISOString(),
                last_sign_in_at: null,
                user_metadata: {
                  user_type: profile.user_type || 'client'
                },
                app_metadata: {
                  provider: 'email'
                }
              });
            }
          } catch (err) {
            console.warn('Error fetching auth user:', err);
            // Add profile data without auth info
            authUsers.push({
              id: profile.user_id,
              email: 'Email not available',
              created_at: new Date().toISOString(),
              last_sign_in_at: null,
              user_metadata: {
                user_type: profile.user_type || 'client'
              },
              app_metadata: {
                provider: 'email'
              }
            });
          }
        }
      }
      
      setUsers(authUsers);

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
      // Use admin API to generate password reset
      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: users.find(u => u.id === userId)?.email || '',
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset email sent');
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
      
      // First delete the auth user
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        console.warn('Could not delete auth user:', authDeleteError);
      }

      // Delete from user_profiles table
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
