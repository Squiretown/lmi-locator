
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserManagement } from './hooks/useUserManagement';
import { UsersTable } from './components/UsersTable';
import { UsersPageHeader } from '@/components/users/UsersPageHeader';
import { UsersSearch } from '@/components/users/UsersSearch';
import { UserStatistics } from '@/components/users/UserStatistics';
import { UserAdvancedFilters } from '@/components/users/UserAdvancedFilters';
import { UserRecentActivity } from '@/components/users/UserRecentActivity';
import { UserPagination } from '@/components/users/UserPagination';
import SignOutAllUsersButton from '@/components/admin/SignOutAllUsersButton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserPlus, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    timeRange: 'all',
  });
  
  const usersPerPage = 20;
  
  const { 
    users, 
    isLoading, 
    error, 
    handleResetPassword, 
    handleDisableUser,
    handleDeleteUser
  } = useUserManagement();

  // Calculate statistics from real data only
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(user => user.user_metadata?.user_type !== 'inactive').length || 0;
  const newSignups = 0; // This would need to be calculated from actual signup dates
  const pendingVerifications = 0; // This would need to be calculated from actual verification status

  const handleAddUser = () => {
    setAddUserDialogOpen(true);
  };

  const handleManageRoles = () => {
    window.location.href = '/admin/permissions';
  };

  const handleExportUsers = () => {
    toast.info('Export functionality will be implemented');
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleBulkAction = (action: string, userIds: string[]) => {
    console.log('Bulk action:', action, 'for users:', userIds);
    toast.info(`Bulk action "${action}" will be implemented for ${userIds.length} users`);
  };

  const handleUserSelection = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Enhanced search functionality
  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = user.user_metadata?.first_name || user.user_metadata?.last_name || '';
    const userId = user.id.toLowerCase();
    const userType = user.user_metadata?.user_type?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    
    const matchesSearch = (
      userId.includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower) ||
      userType.includes(searchLower) ||
      email.includes(searchLower)
    );

    // Apply filters
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && userType !== 'inactive') ||
      (filters.status === 'inactive' && userType === 'inactive');

    const matchesRole = filters.role === 'all' || userType === filters.role;

    return matchesSearch && matchesStatus && matchesRole;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-muted-foreground">Manage users and their access permissions</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportUsers} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Users
              </Button>
              <Button onClick={handleManageRoles} variant="outline">
                Manage Roles
              </Button>
              <Button onClick={handleAddUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </div>
          </div>

          {/* Statistics - only real data */}
          <UserStatistics
            totalUsers={totalUsers}
            activeUsers={activeUsers}
            newSignups={newSignups}
            pendingVerifications={pendingVerifications}
          />

          {/* Search */}
          <UsersSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Advanced Filters */}
          <UserAdvancedFilters
            onFiltersChange={handleFiltersChange}
            onBulkAction={handleBulkAction}
            selectedUsers={selectedUsers}
            totalUsers={filteredUsers.length}
          />

          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Database Error:</strong> {error}</p>
                  <p className="text-sm">
                    The RLS infinite recursion issue has been fixed. Try refreshing if you still see this error.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!error && !isLoading && users.length > 0 && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <p className="text-green-800">
                  <strong>Database Connected:</strong> Successfully loaded {users.length} user profiles with fixed RLS policies.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Users Table */}
          <div className="rounded-md border">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Users ({filteredUsers.length})</h3>
            </div>
            
            <UsersTable
              users={paginatedUsers}
              isLoading={isLoading}
              error={null}
              onResetPassword={handleResetPassword}
              onDisableUser={handleDisableUser}
              onDeleteUser={handleDeleteUser}
              selectedUsers={selectedUsers}
              onUserSelection={handleUserSelection}
              onSelectAll={handleSelectAll}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <UserPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalUsers={filteredUsers.length}
                usersPerPage={usersPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <SignOutAllUsersButton />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - only real data, empty state if no data */}
      <UserRecentActivity activities={[]} />

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
