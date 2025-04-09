
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LockOpen } from 'lucide-react';
import { useUserManagement } from './hooks/useUserManagement';
import { UsersTable } from './components/UsersTable';
import SignOutAllUsersButton from '@/components/admin/SignOutAllUsersButton';

const UserManagement: React.FC = () => {
  const { 
    users, 
    isLoading, 
    error, 
    handleResetPassword, 
    handleDisableUser 
  } = useUserManagement();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users and their access permissions
          </CardDescription>
        </div>
        <SignOutAllUsersButton />
      </CardHeader>
      <CardContent>
        <UsersTable
          users={users}
          isLoading={isLoading}
          error={error}
          onResetPassword={handleResetPassword}
          onDisableUser={handleDisableUser}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagement;
