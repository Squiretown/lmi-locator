
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
  // Debug logging to help identify issues
  React.useEffect(() => {
    console.log('UsersTable Debug Info:', {
      usersCount: users?.length || 0,
      isLoading,
      error,
      users: users?.slice(0, 3), // Log first 3 users for debugging
      selectedUsers: selectedUsers?.length || 0
    });
  }, [users, isLoading, error, selectedUsers]);

  // Loading state
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

  // Error state with more details
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-red-900 mb-2">Error Loading Users</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state with helpful message
  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-muted-foreground mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 119.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-2">No Users Found</h3>
          <p className="text-muted-foreground mb-4">
            No users exist in the system or you don't have permission to view them.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Possible reasons:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Database is empty</li>
              <li>RLS policies are blocking access</li>
              <li>User doesn't have admin permissions</li>
              <li>API connection issues</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getDisplayName = (user: AdminUser) => {
    // Try multiple sources for user name
    const metadata = user.user_metadata || {};
    const rawMetadata = user.raw_user_meta_data || {};
    
    // Check various name fields
    const firstName = metadata.first_name || rawMetadata.first_name || metadata.firstName || rawMetadata.firstName;
    const lastName = metadata.last_name || rawMetadata.last_name || metadata.lastName || rawMetadata.lastName;
    const fullName = metadata.full_name || rawMetadata.full_name || metadata.fullName || rawMetadata.fullName;
    const name = metadata.name || rawMetadata.name;
    
    if (fullName) return fullName;
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    if (name) return name;
    
    // Fallback to email or user ID
    return user.email || `User ${user.id.substring(0, 8)}`;
  };

  const getUserAvatar = (user: AdminUser) => {
    const name = getDisplayName(user);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getUserStatus = (user: AdminUser) => {
    // Check multiple ways to determine user status
    const metadata = user.user_metadata || {};
    const rawMetadata = user.raw_user_meta_data || {};
    
    // Check for explicit status fields
    if (metadata.status) return metadata.status;
    if (rawMetadata.status) return rawMetadata.status;
    if (metadata.user_status) return metadata.user_status;
    if (rawMetadata.user_status) return rawMetadata.user_status;
    
    // Check if user is banned/blocked
    if (user.banned_until) return 'banned';
    
    // Check email confirmation
    if (!user.email_confirmed_at) return 'pending';
    
    // Check last sign in (consider inactive if no recent activity)
    if (user.last_sign_in_at) {
      const lastSignIn = new Date(user.last_sign_in_at);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (lastSignIn < sixMonthsAgo) return 'inactive';
    }
    
    return 'active';
  };

  const getUserType = (user: AdminUser) => {
    const metadata = user.user_metadata || {};
    const rawMetadata = user.raw_user_meta_data || {};
    
    return metadata.user_type || 
           rawMetadata.user_type || 
           metadata.userType || 
           rawMetadata.userType || 
           metadata.role || 
           rawMetadata.role || 
           'user';
  };

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <div className="space-y-4">
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Debug: {users.length} users loaded, {selectedUsers.length} selected
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            {onUserSelection && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
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
          {users.map((user) => {
            const userStatus = getUserStatus(user);
            const userType = getUserType(user);
            
            return (
              <TableRow key={user.id}>
                {onUserSelection && (
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => onUserSelection(user.id, e.target.checked)}
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
                      {user.phone && (
                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <UserTypeBadge userType={userType} />
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      userStatus === 'active' ? 'default' :
                      userStatus === 'pending' ? 'secondary' :
                      userStatus === 'banned' ? 'destructive' :
                      'outline'
                    }
                  >
                    {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    {formatDate(user.last_sign_in_at)}
                    {user.last_sign_in_at && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(user.last_sign_in_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {formatDate(user.created_at)}
                    {!user.email_confirmed_at && (
                      <div className="text-xs text-yellow-600">Unverified</div>
                    )}
                  </div>
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
