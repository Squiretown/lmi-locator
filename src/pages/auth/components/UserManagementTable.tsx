
import React from 'react';
import { UsersTable } from './UsersTable';
import { UserPagination } from '@/components/users/UserPagination';
import { UserRecentActivity } from '@/components/users/UserRecentActivity';
import type { AdminUser } from '../types/admin-user';

interface UserManagementTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  onResetPassword: (userId: string) => void;
  onDisableUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  selectedUsers: string[];
  onUserSelection: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  filteredUsers: AdminUser[];
  currentPage: number;
  totalPages: number;
  usersPerPage: number;
  onPageChange: (page: number) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  isLoading,
  error,
  onResetPassword,
  onDisableUser,
  onDeleteUser,
  selectedUsers,
  onUserSelection,
  onSelectAll,
  filteredUsers,
  currentPage,
  totalPages,
  usersPerPage,
  onPageChange,
}) => {
  return (
    <>
      <div className="rounded-md border">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Users ({filteredUsers.length})</h3>
        </div>
        
        <UsersTable
          users={users}
          isLoading={isLoading}
          error={error}
          onResetPassword={onResetPassword}
          onDisableUser={onDisableUser}
          onDeleteUser={onDeleteUser}
          selectedUsers={selectedUsers}
          onUserSelection={onUserSelection}
          onSelectAll={onSelectAll}
        />

        {totalPages > 1 && (
          <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalUsers={filteredUsers.length}
            usersPerPage={usersPerPage}
            onPageChange={onPageChange}
          />
        )}
      </div>

      <UserRecentActivity activities={[]} />
    </>
  );
};
