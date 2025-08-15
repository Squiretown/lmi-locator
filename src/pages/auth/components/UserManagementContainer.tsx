
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserManagement } from '../hooks/useUserManagement';
import { useUserManagementState } from '../hooks/useUserManagementState';
import { useUserManagementActions } from '../hooks/useUserManagementActions';
import { UserManagementHeader } from './UserManagementHeader';
import { UserManagementContent } from './UserManagementContent';
import { UserActionDialog } from './UserActionDialog';
import { ProfessionalActionDialog } from './ProfessionalActionDialog';
import { UserManagementDialogs } from './UserManagementDialogs';
import { UserManagementFooter } from './UserManagementFooter';
import type { AdminUser } from '../types/admin-user';

export const UserManagementContainer: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    addUserDialogOpen,
    setAddUserDialogOpen,
    selectedUsers,
    setSelectedUsers,
    currentPage,
    setCurrentPage,
    actionDialog,
    setActionDialog,
    professionalDialog,
    setProfessionalDialog,
    resetActionDialog,
    resetProfessionalDialog,
  } = useUserManagementState();

  const {
    handleUserAction,
    handleActionConfirm,
    handleProfessionalActionConfirm,
    handleBulkActionWrapper,
  } = useUserManagementActions();

  const { users, isLoading, error } = useUserManagement();

  const usersPerPage = 20;

  const handleAddUser = () => {
    setAddUserDialogOpen(true);
  };

  const handleManageRoles = () => {
    window.location.href = '/admin/permissions';
  };

  const handleUserActionWrapper = (action: string, user: AdminUser) => {
    const { isProfessionalAction } = handleUserAction(action, user);

    if (isProfessionalAction) {
      setProfessionalDialog({
        open: true,
        action,
        user,
      });
    } else {
      setActionDialog({
        open: true,
        action,
        user,
      });
    }
  };

  const handleActionConfirmWrapper = async (data?: any) => {
    if (!actionDialog.user || !actionDialog.action) return;
    await handleActionConfirm(actionDialog.user, actionDialog.action, data);
    resetActionDialog();
  };

  const handleProfessionalActionConfirmWrapper = async (data?: any) => {
    if (!professionalDialog.user || !professionalDialog.action) return;
    await handleProfessionalActionConfirm(professionalDialog.user, professionalDialog.action, data);
    resetProfessionalDialog();
  };

  const handleUserSelection = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkActionWrapperWithClear = async (action: string, userIds: string[], data?: any) => {
    const result = await handleBulkActionWrapper(action, userIds, data);
    if (result.success) {
      setSelectedUsers([]);
    }
  };

  // Enhanced search functionality with full name support
  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const displayName = firstName || lastName || '';
    const userId = user.id.toLowerCase();
    const userType = user.user_metadata?.user_type?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    
    return (
      userId.includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower) ||
      fullName.toLowerCase().includes(searchLower) ||
      userType.includes(searchLower) ||
      email.includes(searchLower)
    );
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <UserManagementHeader 
            onAddUser={handleAddUser}
            onManageRoles={handleManageRoles}
          />

          <UserManagementContent
            users={users}
            isLoading={isLoading}
            error={error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedUsers={selectedUsers}
            onBulkAction={handleBulkActionWrapperWithClear}
            onUserAction={handleUserActionWrapper}
            onUserSelection={handleUserSelection}
            onSelectAll={handleSelectAll}
            filteredUsers={filteredUsers}
            currentPage={currentPage}
            totalPages={totalPages}
            usersPerPage={usersPerPage}
            onPageChange={setCurrentPage}
          />
          
          <UserManagementFooter />
        </CardContent>
      </Card>

      <UserManagementDialogs
        addUserDialogOpen={addUserDialogOpen}
        setAddUserDialogOpen={setAddUserDialogOpen}
      />

      <UserActionDialog
        user={actionDialog.user}
        action={actionDialog.action}
        open={actionDialog.open}
        onClose={resetActionDialog}
        onConfirm={handleActionConfirmWrapper}
      />

      <ProfessionalActionDialog
        user={professionalDialog.user}
        action={professionalDialog.action}
        open={professionalDialog.open}
        onClose={resetProfessionalDialog}
        onConfirm={handleProfessionalActionConfirmWrapper}
      />
    </div>
  );
};
