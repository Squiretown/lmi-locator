
import { toast } from 'sonner';
import { useUserActions } from './useUserActions';
import { useUserManagement } from './useUserManagement';
import type { AdminUser } from '../types/admin-user';

export const useUserManagementActions = () => {
  const { refetch } = useUserManagement();
  const {
    isLoading,
    suspendUser,
    changeUserEmail,
    changeUserRole,
    sendEmailToUser,
    resetUserPassword,
    deleteUser,
    disableUser,
    handleBulkAction,
  } = useUserActions();

  const handleUserAction = (action: string, user: AdminUser) => {
    // Check if this is a professional-specific action
    const professionalActions = [
      'verifyLicense', 'viewCredentials', 'updateLicense', 
      'viewClients', 'manageReferrals', 'clientActivity',
      'reviewMarketing', 'marketingStats', 'campaignHistory',
      'approveApplication', 'rejectApplication', 'reviewApplication'
    ];

    return { isProfessionalAction: professionalActions.includes(action) };
  };

  const handleActionConfirm = async (user: AdminUser, action: string, data?: any) => {
    if (!user || !action || isLoading) return;

    try {
      let result;
      switch (action) {
        case 'suspend':
          result = await suspendUser(user.id, data.reason, parseInt(data.duration));
          break;
        case 'changeEmail':
          result = await changeUserEmail(user.id, data.newEmail);
          break;
        case 'changeRole':
          result = await changeUserRole(user.id, data.newRole);
          break;
        case 'sendEmail':
          result = await sendEmailToUser(user.id, data.message);
          break;
        case 'resetPassword':
          result = await resetUserPassword(user.id);
          break;
        case 'delete':
          result = await deleteUser(user.id);
          break;
        case 'disableUser':
          result = await disableUser(user.id);
          break;
        default:
          console.log('Action not implemented:', action);
          return;
      }

      if (result?.success) {
        await refetch();
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleProfessionalActionConfirm = async (user: AdminUser, action: string, data?: any) => {
    if (!user || !action) return;

    try {
      switch (action) {
        case 'verifyLicense':
          toast.success(`License verified for ${user.email}`);
          break;
        case 'viewClients':
          toast.info(`Viewing clients for ${user.email}`);
          break;
        case 'reviewMarketing':
          toast.info(`Reviewing marketing campaigns for ${user.email}`);
          break;
        case 'approveApplication':
          toast.success(`Application approved for ${user.email}`);
          break;
        case 'rejectApplication':
          toast.success(`Application rejected for ${user.email}`);
          break;
        default:
          toast.info(`Professional action performed: ${action}`);
      }

      await refetch();
    } catch (error) {
      console.error('Error performing professional action:', error);
      toast.error('Failed to perform professional action');
    }
  };

  const handleBulkActionWrapper = async (action: string, userIds: string[], data?: any) => {
    if (isLoading) {
      toast.warning('Another action is already in progress');
      return { success: false };
    }

    const result = await handleBulkAction(action, userIds, data);
    if (result?.success) {
      await refetch();
    }
    return result;
  };

  return {
    isLoading,
    handleUserAction,
    handleActionConfirm,
    handleProfessionalActionConfirm,
    handleBulkActionWrapper,
  };
};
