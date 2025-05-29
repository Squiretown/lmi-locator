
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  error,
  onResetPassword,
  onDisableUser,
  onDeleteUser,
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
            No user profiles exist in the system.
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
    return user.id.substring(0, 8) + '...';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-mono text-xs max-w-[120px] truncate" title={user.id}>
                  {user.id.substring(0, 8)}...
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {getDisplayName(user)}
              </TableCell>
              <TableCell>
                <UserTypeBadge userType={user.user_metadata?.user_type} />
              </TableCell>
              <TableCell>
                {formatDate(user.created_at)}
              </TableCell>
              <TableCell>
                {formatDate(user.last_sign_in_at)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.app_metadata?.provider || 'email'}
                </Badge>
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
      
      <div className="px-4 py-3 text-sm text-muted-foreground border-t">
        Showing {users.length} user{users.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
