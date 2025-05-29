
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserManagement } from './hooks/useUserManagement';
import { UsersTable } from './components/UsersTable';
import { UsersPageHeader } from '@/components/users/UsersPageHeader';
import { UsersSearch } from '@/components/users/UsersSearch';
import SignOutAllUsersButton from '@/components/admin/SignOutAllUsersButton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  
  const { 
    users, 
    isLoading, 
    error, 
    handleResetPassword, 
    handleDisableUser,
    handleDeleteUser
  } = useUserManagement();

  const handleAddUser = () => {
    setAddUserDialogOpen(true);
  };

  const handleManageRoles = () => {
    // Navigate to permissions page
    window.location.href = '/admin/permissions';
  };

  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = user.user_metadata?.first_name || user.user_metadata?.last_name || user.id;
    return (
      user.id.toLowerCase().includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower) ||
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

          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Database Error:</strong> {error}</p>
                  <p className="text-sm">
                    This usually means there's an issue with database permissions or connectivity.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <UsersTable
            users={filteredUsers}
            isLoading={isLoading}
            error={null} // Don't show error in table since we show it above
            onResetPassword={handleResetPassword}
            onDisableUser={handleDisableUser}
            onDeleteUser={handleDeleteUser}
          />
          
          <div className="mt-4 flex justify-end">
            <SignOutAllUsersButton />
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </DialogTitle>
            <DialogDescription>
              User creation functionality is not yet implemented. Users can currently only be created through the sign-up process.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To add users, they need to sign up through the registration form or you can implement invitation functionality.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
