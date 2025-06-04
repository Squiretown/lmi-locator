
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserActionMenu } from './UserActionMenu';
import { UserTypeBadge } from './UserTypeBadge';
import type { AdminUser } from '../types/admin-user';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  onResetPassword: (userId: string) => void;
  onDisableUser: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  selectedUsers?: string[];
  onUserSelection?: (userId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  error,
  onResetPassword,
  onDisableUser,
  onDeleteUser,
  selectedUsers = [],
  onUserSelection,
  onSelectAll,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error loading users</div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No users found</p>
          <p className="text-xs text-muted-foreground">
            No users exist in the system or you don't have permission to view them.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getDisplayName = (user: AdminUser) => {
    const { first_name, last_name } = user.user_metadata || {};
    if (first_name || last_name) {
      return `${first_name || ''} ${last_name || ''}`.trim();
    }
    return user.email || `User ${user.id.substring(0, 8)}`;
  };

  const getUserAvatar = (user: AdminUser) => {
    const name = getDisplayName(user);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {onUserSelection && (
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onCheckedChange={(checked) => onSelectAll?.(!!checked)}
              />
            </TableHead>
          )}
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>Registration</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            {onUserSelection && (
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => onUserSelection(user.id, !!checked)}
                />
              </TableCell>
            )}
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {getUserAvatar(user)}
                </div>
                <div>
                  <div className="font-medium">{getDisplayName(user)}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <UserTypeBadge userType={user.user_metadata?.user_type} />
            </TableCell>
            <TableCell>
              <Badge variant={user.user_metadata?.user_type !== 'inactive' ? 'success' : 'destructive'}>
                {user.user_metadata?.user_type !== 'inactive' ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDate(user.last_sign_in_at)}
            </TableCell>
            <TableCell>
              {formatDate(user.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <UserActionMenu
                user={user}
                onResetPassword={() => onResetPassword(user.id)}
                onDisableUser={() => onDisableUser(user.id)}
                onDeleteUser={onDeleteUser ? () => onDeleteUser(user.id) : undefined}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
