
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LockOpen } from 'lucide-react';
import { useUserManagement } from './hooks/useUserManagement';
import { UsersTable } from './components/UsersTable';

const UserManagement: React.FC = () => {
  const { 
    users, 
    isLoading, 
    error, 
    handleResetPassword, 
    handleDisableUser, 
    handleSignOutAllUsers 
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
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleSignOutAllUsers}
        >
          <LockOpen className="mr-2 h-4 w-4" />
          Sign Out All Users
        </Button>
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
