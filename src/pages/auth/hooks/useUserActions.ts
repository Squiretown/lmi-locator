import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getValidSession } from '@/lib/auth/getValidSession';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

export const useUserActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const logAdminError = async (operation: string, error: any, targetUserId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('admin_error_logs').insert({
        admin_user_id: user.id,
        error_type: error.code || 'unknown',
        error_message: error.message || String(error),
        error_details: error,
        operation,
        target_user_id: targetUserId,
        ip_address: null,
        user_agent: navigator.userAgent
      });
    } catch (logError) {
      console.error('Failed to log admin error:', logError);
    }
  };

  const suspendUser = async (userId: string, reason: string, duration: number) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!reason || reason.trim() === '') {
        throw new Error('Suspension reason is required');
      }
      if (!duration || isNaN(duration) || duration <= 0) {
        throw new Error('Valid suspension duration is required');
      }

      console.log('Suspending user with data:', { userId, reason, duration });
      
      // ✅ FIXED: Using invokeEdgeFunction
      const { data, error } = await invokeEdgeFunction('suspend-user', { 
        userId, 
        reason, 
        duration 
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('Edge function returned failure:', data);
        throw new Error(data?.error || 'Unknown error occurred');
      }

      // Force logout the suspended user (best-effort)
      try {
        await invokeEdgeFunction('force-logout-user', { userId });
      } catch (logoutError) {
        console.warn('Failed to force logout suspended user:', logoutError);
        // Don't fail the whole operation if logout fails
      }

      toast.success('User suspended successfully');
      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to suspend user';
      toast.error(`Failed to suspend user: ${errorMessage}`);
      await logAdminError('suspend_user', error, userId);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const unsuspendUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Unsuspending user:', userId);
      
      // ✅ FIXED: Using invokeEdgeFunction
      const { data, error } = await invokeEdgeFunction('unsuspend-user', { userId });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('Edge function returned failure:', data);
        throw new Error(data?.error || 'Unknown error occurred');
      }

      toast.success('User unsuspended successfully');
      return { success: true };
    } catch (error) {
      console.error('Error unsuspending user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unsuspend user';
      toast.error(`Failed to unsuspend user: ${errorMessage}`);
      await logAdminError('unsuspend_user', error, userId);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const changeUserEmail = async (userId: string, newEmail: string) => {
    try {
      setIsLoading(true);
      
      // ✅ FIXED: Using invokeEdgeFunction
      const { data, error } = await invokeEdgeFunction('update-user-email', { 
        userId, 
        newEmail 
      });

      if (error) throw error;

      toast.success('User email updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating user email:', error);
      toast.error('Failed to update user email');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      setIsLoading(true);
      
      // ✅ FIXED: Using invokeEdgeFunction
      const { data, error } = await invokeEdgeFunction('update-user-role', { 
        userId, 
        newRole 
      });

      if (error) throw error;

      toast.success('User role updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailToUser = async (userId: string, message: string) => {
    try {
      setIsLoading(true);
      
      // ✅ FIXED: Using invokeEdgeFunction
      const { data, error } = await invokeEdgeFunction('send-user-email', { 
        userId, 
        message 
      });

      if (error) throw error;

      toast.success('Email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserPassword = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // ✅ FIXED: Using invokeEdgeFunction
      const { data, error } = await invokeEdgeFunction('reset-user-password', { userId });

      if (error) throw error;

      toast.success('Password reset email sent to user');
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset user password');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to completely delete user from auth:', userId);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('Failed to retrieve user');
        const error = new Error('Authentication required - please log in again');
        await logAdminError('delete_user', error, userId);
        throw error;
      }

      // ✅ FIXED: Using invokeEdgeFunction
      const { data, error } = await invokeEdgeFunction('delete-user', { 
        user_id: userId 
      });

      if (error) {
        console.error('Edge function error:', error);
        if (error.message?.includes('User not found') || error.message?.includes('404')) {
          console.log(`User ${userId} was already deleted`);
          toast.info("User was already deleted");
          return { success: true };
        }
        await logAdminError('delete_user', error, userId);
        throw error;
      }

      if (!data?.success) {
        if (data?.error?.includes('User not found') || data?.error?.includes('404')) {
          console.log(`User ${userId} was already deleted`);
          toast.info("User was already deleted");
          return { success: true };
        }
        await logAdminError('delete_user', new Error(data?.error || 'Unknown error occurred'), userId);
        throw new Error(data?.error || 'Unknown error occurred');
      }

      toast.success('User deleted successfully from authentication system');
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (error instanceof Error && (error.message?.includes('User not found') || error.message?.includes('404'))) {
        toast.info("User was already deleted");
        return { success: true };
      }
      
      await logAdminError('delete_user', error, userId);
      toast.error('Failed to delete user');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const disableUser = async (userId: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to delete user profile only:', userId);
      
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        await logAdminError('disable_user', deleteError, userId);
        throw deleteError;
      }

      toast.success('User profile removed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error removing user profile:', error);
      await logAdminError('disable_user', error, userId);
      toast.error('Failed to remove user profile');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string, userIds: string[], data?: any) => {
    if (isLoading) {
      toast.warning('Another action is already in progress');
      return { success: false };
    }

    try {
      setIsLoading(true);
      
      const results = await Promise.allSettled(
        userIds.map(async (userId) => {
          switch (action) {
            case 'activate':
              return await changeUserRole(userId, 'client');
            
            case 'deactivate':
              return await suspendUser(userId, 'Bulk deactivation', 8760);
            
            case 'sendEmail':
              return await sendEmailToUser(userId, data?.message || 'Bulk message from admin');
            
            case 'changeRole':
              return await changeUserRole(userId, data?.role || 'client');
            
            case 'resetPassword':
              return await resetUserPassword(userId);
            
            case 'export':
              return { success: true };
            
            default:
              throw new Error('Unknown bulk action');
          }
        })
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (failed > 0) {
        toast.warning(`Bulk action completed: ${successful} successful, ${failed} failed`);
      } else {
        toast.success(`Bulk action completed successfully for ${successful} users`);
      }

      return { success: true, successful, failed };
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    suspendUser,
    unsuspendUser,
    changeUserEmail,
    changeUserRole,
    sendEmailToUser,
    resetUserPassword,
    deleteUser,
    disableUser,
    handleBulkAction,
    logAdminError,
  };
};