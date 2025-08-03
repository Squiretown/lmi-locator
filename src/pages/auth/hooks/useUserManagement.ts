
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AdminUser } from '../types/admin-user';

export const useUserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logAdminError = async (operation: string, error: any, targetUserId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from('admin_error_logs').insert({
        admin_user_id: session.user.id,
        error_type: error.code || 'unknown',
        error_message: error.message || String(error),
        error_details: error,
        operation,
        target_user_id: targetUserId,
        ip_address: null, // Client-side doesn't have access to IP
        user_agent: navigator.userAgent
      });
    } catch (logError) {
      console.error('Failed to log admin error:', logError);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching auth users via admin API...');
      
      // Get current session to check if user is admin
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const error = new Error('No active session found');
        await logAdminError('fetch_users', error);
        throw error;
      }

      // Check if current user is admin
      const userType = session.user?.user_metadata?.user_type;
      if (userType !== 'admin') {
        const error = new Error('Admin privileges required to view users');
        await logAdminError('fetch_users', error);
        throw error;
      }

      // Use the admin listUsers function via edge function
      const { data: authData, error: authError } = await supabase.functions.invoke('list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (authError) {
        console.error('Failed to fetch auth users:', authError);
        await logAdminError('fetch_users', authError);
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const error = new Error('No active session found');
        await logAdminError('reset_password', error, userId);
        throw error;
      }

      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        await logAdminError('reset_password', error, userId);
        throw error;
      }

      if (!data?.success) {
        const errorDetails = { success: data?.success, error: data?.error };
        await logAdminError('reset_password', new Error(data?.error || 'Password reset failed'), userId);
        throw new Error(data?.error || 'Password reset failed');
      }

      toast.success('Password reset email sent to user');
    } catch (err) {
      console.error('Error resetting password:', err);
      await logAdminError('reset_password', err, userId);
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
        await logAdminError('disable_user', deleteError, userId);
        throw deleteError;
      }

      toast.success('User profile removed successfully');
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error removing user profile:', err);
      await logAdminError('disable_user', err, userId);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user profile';
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('Attempting to completely delete user from auth:', userId);
      
      // Refresh session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError || !session) {
        console.error('Session refresh failed:', sessionError);
        const error = new Error('Authentication required - please log in again');
        await logAdminError('delete_user', error, userId);
        throw error;
      }
      
      console.log('Session refreshed successfully for user deletion');

      // Call the delete-user edge function
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        // Handle specific "User not found" errors gracefully
        if (error.message?.includes('User not found') || error.message?.includes('404')) {
          console.log(`User ${userId} was already deleted, refreshing list`);
          toast.info("User was already deleted, refreshing list...");
          await fetchUsers(); // Refresh the list
          return;
        }
        await logAdminError('delete_user', error, userId);
        throw error;
      }

      if (!data?.success) {
        // Handle specific "User not found" errors from the function response
        if (data?.error?.includes('User not found') || data?.error?.includes('404')) {
          console.log(`User ${userId} was already deleted, refreshing list`);
          toast.info("User was already deleted, refreshing list...");
          await fetchUsers(); // Refresh the list
          return;
        }
        const errorDetails = { success: data?.success, error: data?.error };
        await logAdminError('delete_user', new Error(data?.error || 'Unknown error occurred'), userId);
        throw new Error(data?.error || 'Unknown error occurred');
      }

      toast.success('User deleted successfully from authentication system');
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user:', err);
      
      // Handle "User not found" errors gracefully
      if (err instanceof Error && (err.message?.includes('User not found') || err.message?.includes('404'))) {
        toast.info("User was already deleted, refreshing list...");
        await fetchUsers(); // Refresh the list
        return;
      }
      
      await logAdminError('delete_user', err, userId);
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
    refetch: fetchUsers,
    logAdminError
  };
};
