
import { toast } from 'sonner';
import { useUserActions } from './useUserActions';
import { useUserManagement } from './useUserManagement';
import type { AdminUser } from '../types/admin-user';

export const useUserManagementActions = () => {
  const { refetch, handleDeleteUser, handleDisableUser } = useUserManagement();
  const {
    suspendUser,
    changeUserEmail,
    changeUserRole,
    sendEmailToUser,
    resetUserPassword,
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
    if (!user || !action) return;

    try {
      switch (action) {
        case 'suspend':
          await suspendUser(user.id, data.reason, parseInt(data.duration));
          break;
        case 'changeEmail':
          await changeUserEmail(user.id, data.newEmail);
          break;
        case 'changeRole':
          await changeUserRole(user.id, data.newRole);
          break;
        case 'sendEmail':
          await sendEmailToUser(user.id, data.message);
          break;
        case 'resetPassword':
          await resetUserPassword(user.id);
          break;
        case 'delete':
          await handleDeleteUser(user.id);
          break;
        case 'disableUser':
          await handleDisableUser(user.id);
          break;
        default:
          console.log('Action not implemented:', action);
      }

      await refetch();
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
    try {
      await handleBulkAction(action, userIds, data);
      await refetch();
      toast.success(`Bulk action "${action}" completed successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
      return { success: false };
    }
  };

  return {
    handleUserAction,
    handleActionConfirm,
    handleProfessionalActionConfirm,
    handleBulkActionWrapper,
  };
};
