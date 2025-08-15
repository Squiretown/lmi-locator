
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { UserActionMenu } from './UserActionMenu';
import { ProfessionalActions } from './ProfessionalActions';
import { UserStatusBadge } from './UserStatusBadge';
import { UserTypeBadge } from './UserTypeBadge';
import { UserRoleManagement } from '@/components/admin/users/UserRoleManagement';
import { UserPagination } from '@/components/users/UserPagination';
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
  const getUserType = (user: AdminUser) => {
    return user.user_metadata?.user_type || 'client';
  };

  const isEmailVerified = (user: AdminUser) => {
    return !!user.app_metadata?.email_verified || !!user.email;
  };

  const getDisplayName = (user: AdminUser) => {
    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    
    return user.email || 'No name';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          Error loading users: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (users.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No users found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => onUserSelection(user.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{getDisplayName(user)}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground font-mono">{user.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <UserRoleManagement user={user} />
                </TableCell>
                <TableCell>
                  <UserStatusBadge 
                    status={getUserType(user)}
                    isEmailVerified={isEmailVerified(user)}
                    lastSignIn={user.last_sign_in_at}
                    user={user}
                  />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ProfessionalActions user={user} onAction={onUserAction} />
                    <UserActionMenu user={user} onAction={onUserAction} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
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
  );
};
