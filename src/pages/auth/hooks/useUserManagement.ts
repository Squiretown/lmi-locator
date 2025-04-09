
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminUser, UserManagementState } from '../types/admin-user';

export function useUserManagement() {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      setState(prev => ({ 
        ...prev, 
        users: data.users || [], 
        isLoading: false 
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load users. You may not have sufficient permissions.',
        isLoading: false
      }));
      toast.error('Failed to load users. You may not have sufficient permissions.');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      toast.info('Password reset functionality will be available soon.');
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error('Failed to reset password');
    }
  };

  const handleDisableUser = async (userId: string) => {
    try {
      toast.info('User disable functionality will be available soon.');
    } catch (err) {
      console.error('Error disabling user:', err);
      toast.error('Failed to disable user');
    }
  };

  return {
    ...state,
    handleResetPassword,
    handleDisableUser,
  };
}
