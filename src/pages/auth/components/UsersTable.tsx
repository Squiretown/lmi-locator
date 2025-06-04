
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreHorizontal } from 'lucide-react';
import { UserActionMenu } from './UserActionMenu';
import { UserStatusBadge } from './UserStatusBadge';
import type { AdminUser } from '../types/admin-user';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  onUserAction: (action: string, user: AdminUser) => void;
  selectedUsers: string[];
  onUserSelection: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails?: (user: AdminUser) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  error,
  onUserAction,
  selectedUsers,
  onUserSelection,
  onSelectAll,
  onViewDetails,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">Error loading users</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  const getUserType = (user: AdminUser) => {
    return user.user_metadata?.user_type || 'client';
  };

  const isEmailVerified = (user: AdminUser) => {
    return !!user.app_metadata?.email_verified || !!user.email;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = someSelected;
                }
              }}
              onCheckedChange={(checked) => onSelectAll(!!checked)}
            />
          </TableHead>
          <TableHead>User</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last Sign In</TableHead>
          <TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={(checked) => 
                  onUserSelection(user.id, !!checked)
                }
              />
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{user.email}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {user.id.substring(0, 8)}...
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {getUserType(user)}
              </Badge>
            </TableCell>
            <TableCell>
              <UserStatusBadge 
                status={getUserType(user)}
                isEmailVerified={isEmailVerified(user)}
                lastSignIn={user.last_sign_in_at}
              />
            </TableCell>
            <TableCell>{formatDate(user.created_at)}</TableCell>
            <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {onViewDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <UserActionMenu
                  user={user}
                  onAction={(action) => onUserAction(action, user)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
