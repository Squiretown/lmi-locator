
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const suspendUser = async (userId: string, reason: string, duration: number) => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call edge function to suspend user
      const { data, error } = await supabase.functions.invoke('suspend-user', {
        body: { userId, reason, duration },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast.success('User suspended successfully');
      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
      return { success: false, error };
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
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call edge function to send email
      const { data, error } = await supabase.functions.invoke('send-user-email', {
        body: { userId, message },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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
      
      // Process each user individually for now
      // In a production system, you might want to create a bulk operations edge function
      const results = await Promise.allSettled(
        userIds.map(async (userId) => {
          switch (action) {
            case 'activate':
              // For now, just remove suspension metadata
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) throw new Error('No active session');
              
              return await supabase.functions.invoke('update-user-role', {
                body: { userId, newRole: 'client' }, // Default to client role
                headers: { Authorization: `Bearer ${session.access_token}` }
              });
            
            case 'deactivate':
              return await suspendUser(userId, 'Bulk deactivation', 8760); // 1 year
            
            case 'sendEmail':
              return await sendEmailToUser(userId, data?.message || 'Bulk message from admin');
            
            case 'changeRole':
              return await changeUserRole(userId, data?.role || 'client');
            
            case 'resetPassword':
              return await resetUserPassword(userId);
            
            case 'export':
              // This would typically export user data
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
    changeUserEmail,
    changeUserRole,
    sendEmailToUser,
    resetUserPassword,
    handleBulkAction,
  };
};
