
import React from 'react';
import { UserManagementStats } from './UserManagementStats';
import { UserManagementSearch } from './UserManagementSearch';
import { UserBulkActions } from './UserBulkActions';
import { UserManagementTable } from './UserManagementTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { AdminUser } from '../types/admin-user';

interface UserManagementContentProps {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedUsers: string[];
  onBulkAction: (action: string, userIds: string[], data?: any) => void;
  onUserAction: (action: string, user: AdminUser) => void;
  onUserSelection: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  filteredUsers: AdminUser[];
  currentPage: number;
  totalPages: number;
  usersPerPage: number;
  onPageChange: (page: number) => void;
}

export const UserManagementContent: React.FC<UserManagementContentProps> = ({
  users,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  selectedUsers,
  onBulkAction,
  onUserAction,
  onUserSelection,
  onSelectAll,
  filteredUsers,
  currentPage,
  totalPages,
  usersPerPage,
  onPageChange,
}) => {
  // Calculate statistics from real data only
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(user => user.user_metadata?.user_type !== 'inactive').length || 0;
  const newSignups = 0;
  const pendingVerifications = 0;

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <>
      <UserManagementStats
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        newSignups={newSignups}
        pendingVerifications={pendingVerifications}
      />

      <UserManagementSearch
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      <UserBulkActions
        selectedUsers={selectedUsers}
        onBulkAction={onBulkAction}
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
        onUserAction={onUserAction}
        selectedUsers={selectedUsers}
        onUserSelection={onUserSelection}
        onSelectAll={onSelectAll}
        filteredUsers={filteredUsers}
        currentPage={currentPage}
        totalPages={totalPages}
        usersPerPage={usersPerPage}
        onPageChange={onPageChange}
      />
    </>
  );
};
