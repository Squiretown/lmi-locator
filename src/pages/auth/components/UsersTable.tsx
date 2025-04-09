
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminUser } from '../types/admin-user';
import { UserTypeBadge } from './UserTypeBadge';
import { UserActionMenu } from './UserActionMenu';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  onResetPassword: (userId: string) => void;
  onDisableUser: (userId: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  isLoading, 
  error, 
  onResetPassword, 
  onDisableUser 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="font-medium">{user.email}</div>
              <div className="text-sm text-muted-foreground">
                {user.user_metadata?.first_name} {user.user_metadata?.last_name}
              </div>
            </TableCell>
            <TableCell>
              <UserTypeBadge userType={user.user_metadata?.user_type} />
            </TableCell>
            <TableCell>
              {new Date(user.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {user.last_sign_in_at 
                ? new Date(user.last_sign_in_at).toLocaleDateString() 
                : 'Never'}
            </TableCell>
            <TableCell className="text-right">
              <UserActionMenu
                userId={user.id}
                userType={user.user_metadata?.user_type}
                onResetPassword={onResetPassword}
                onDisableUser={onDisableUser}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
