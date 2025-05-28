
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserManagement } from './hooks/useUserManagement';
import { UsersTable } from './components/UsersTable';
import { UsersPageHeader } from '@/components/users/UsersPageHeader';
import { UsersSearch } from '@/components/users/UsersSearch';
import SignOutAllUsersButton from '@/components/admin/SignOutAllUsersButton';

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    users, 
    isLoading, 
    error, 
    handleResetPassword, 
    handleDisableUser 
  } = useUserManagement();

  const handleAddUser = () => {
    // TODO: Implement add user functionality
    console.log('Add user clicked');
  };

  const handleManageRoles = () => {
    // TODO: Implement manage roles functionality
    console.log('Manage roles clicked');
  };

  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.user_metadata?.first_name?.toLowerCase().includes(searchLower) ||
      user.user_metadata?.last_name?.toLowerCase().includes(searchLower) ||
      user.user_metadata?.user_type?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-6">
          <UsersPageHeader
            onAddClick={handleAddUser}
            onManageRolesClick={handleManageRoles}
          />

          <UsersSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <UsersTable
            users={filteredUsers}
            isLoading={isLoading}
            error={error}
            onResetPassword={handleResetPassword}
            onDisableUser={handleDisableUser}
          />
          
          <div className="mt-4 flex justify-end">
            <SignOutAllUsersButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
