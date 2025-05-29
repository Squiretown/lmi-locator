
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    user_type?: string;
  };
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching users from auth.users...');
      
      // Try to fetch users using the admin API
      const { data: { users: authUsers }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('Error fetching users from auth.users:', usersError);
        
        // Fallback: try to get basic user info from user_profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, user_type')
          .order('created_at', { ascending: false });

        if (profilesError) {
          throw new Error(`Failed to fetch users: ${profilesError.message}`);
        }

        // If we only have profiles, create minimal user objects
        const minimalUsers = profiles?.map(profile => ({
          id: profile.user_id,
          email: 'Email not available',
          created_at: new Date().toISOString(),
          last_sign_in_at: null,
          user_metadata: {
            user_type: profile.user_type
          },
          app_metadata: {}
        })) || [];

        setUsers(minimalUsers);
        setError('Limited user data available. Admin access may be restricted.');
        return;
      }

      console.log('Successfully fetched users:', authUsers?.length || 0);
      setUsers(authUsers || []);

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
      console.log('Resetting password for user:', userId);
      
      const user = users.find(u => u.id === userId);
      if (!user?.email || user.email === 'Email not available') {
        toast.error('Cannot reset password: email not available');
        return;
      }

      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: user.email,
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset link generated successfully');
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      toast.error(errorMessage);
    }
  };

  const handleDisableUser = async (userId: string) => {
    try {
      console.log('Disabling user:', userId);
      
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none' // This will disable the user
      });

      if (error) {
        throw error;
      }

      toast.success('User disabled successfully');
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error disabling user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable user';
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
    refetch: fetchUsers
  };
};
