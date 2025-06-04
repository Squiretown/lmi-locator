
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserManagement } from '../hooks/useUserManagement';
import { useUserActions } from '../hooks/useUserActions';
import { UserManagementHeader } from './UserManagementHeader';
import { UserManagementStats } from './UserManagementStats';
import { UserManagementSearch } from './UserManagementSearch';
import { UserBulkActions } from './UserBulkActions';
import { UserManagementTable } from './UserManagementTable';
import { UserActionDialog } from './UserActionDialog';
import { UserManagementDialogs } from './UserManagementDialogs';
import { UserManagementFooter } from './UserManagementFooter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { AdminUser } from '../types/admin-user';

export const UserManagementContainer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: string | null;
    user: AdminUser | null;
  }>({
    open: false,
    action: null,
    user: null,
  });
  
  const usersPerPage = 20;
  
  const { 
    users, 
    isLoading, 
    error, 
    handleResetPassword, 
    handleDisableUser,
    handleDeleteUser,
    refetch
  } = useUserManagement();

  const {
    suspendUser,
    changeUserEmail,
    changeUserRole,
    sendEmailToUser,
    resetUserPassword,
    handleBulkAction,
  } = useUserActions();

  // Calculate statistics from real data only
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(user => user.user_metadata?.user_type !== 'inactive').length || 0;
  const newSignups = 0;
  const pendingVerifications = 0;

  const handleAddUser = () => {
    setAddUserDialogOpen(true);
  };

  const handleManageRoles = () => {
    window.location.href = '/admin/permissions';
  };

  const handleUserAction = (action: string, user: AdminUser) => {
    setActionDialog({
      open: true,
      action,
      user,
    });
  };

  const handleActionConfirm = async (data?: any) => {
    if (!actionDialog.user || !actionDialog.action) return;

    const { user, action } = actionDialog;

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

    setActionDialog({ open: false, action: null, user: null });
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

  // Enhanced search functionality
  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = user.user_metadata?.first_name || user.user_metadata?.last_name || '';
    const userId = user.id.toLowerCase();
    const userType = user.user_metadata?.user_type?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    
    return (
      userId.includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower) ||
      userType.includes(searchLower) ||
      email.includes(searchLower)
    );
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <UserManagementHeader 
            onAddUser={handleAddUser}
            onManageRoles={handleManageRoles}
          />

          <UserManagementStats
            totalUsers={totalUsers}
            activeUsers={activeUsers}
            newSignups={newSignups}
            pendingVerifications={pendingVerifications}
          />

          <UserManagementSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <UserBulkActions
            selectedUsers={selectedUsers}
            onBulkAction={handleBulkAction}
            totalUsers={filteredUsers.length}
          />

          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Error:</strong> {error}</p>
                  <p className="text-sm">
                    This might be due to missing admin permissions or the users not being properly authenticated.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!error && !isLoading && users.length > 0 && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <p className="text-green-800">
                  <strong>Successfully Connected:</strong> Loaded {users.length} auth users from Supabase. You can now manage users directly from the authentication system.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <UserManagementTable
            users={paginatedUsers}
            isLoading={isLoading}
            error={null}
            onUserAction={handleUserAction}
            selectedUsers={selectedUsers}
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
        onClose={() => setActionDialog({ open: false, action: null, user: null })}
        onConfirm={handleActionConfirm}
      />
    </div>
  );
};
