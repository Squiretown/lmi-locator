
import React from 'react';
import { UsersTable } from './UsersTable';
import { UserPagination } from '@/components/users/UserPagination';
import { UserRecentActivity } from '@/components/users/UserRecentActivity';
import type { AdminUser } from '../types/admin-user';

interface UserManagementTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  onUserAction: (action: string, user: AdminUser) => void;
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
  onUserAction,
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
          onUserAction={onUserAction}
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
