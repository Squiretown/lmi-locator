
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const suspendUser = async (userId: string, reason: string, duration: number) => {
    try {
      setIsLoading(true);
      toast.info('Suspend user functionality needs to be implemented');
      // TODO: Implement suspend user logic
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    } finally {
      setIsLoading(false);
    }
  };

  const changeUserEmail = async (userId: string, newEmail: string) => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call edge function to update user email
      const { data, error } = await supabase.functions.invoke('update-user-email', {
        body: { userId, newEmail },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call edge function to update user role
      const { data, error } = await supabase.functions.invoke('update-user-role', {
        body: { userId, newRole },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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
      toast.info('Send email functionality needs to be implemented');
      // TODO: Implement send email logic
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserPassword = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call edge function to reset user password
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

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

  const handleBulkAction = async (action: string, userIds: string[], data?: any) => {
    try {
      setIsLoading(true);
      
      switch (action) {
        case 'activate':
          toast.info(`Bulk activate functionality will be implemented for ${userIds.length} users`);
          break;
        case 'deactivate':
          toast.info(`Bulk deactivate functionality will be implemented for ${userIds.length} users`);
          break;
        case 'sendEmail':
          toast.info(`Bulk email functionality will be implemented for ${userIds.length} users`);
          break;
        case 'changeRole':
          toast.info(`Bulk role change functionality will be implemented for ${userIds.length} users`);
          break;
        case 'resetPassword':
          toast.info(`Bulk password reset functionality will be implemented for ${userIds.length} users`);
          break;
        case 'export':
          toast.info(`Export functionality will be implemented for ${userIds.length} users`);
          break;
        default:
          toast.error('Unknown bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    suspendUser,
    changeUserEmail,
    changeUserRole,
    sendEmailToUser,
    resetUserPassword,
    handleBulkAction,
  };
};
