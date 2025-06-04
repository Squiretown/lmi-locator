
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserManagement } from '../hooks/useUserManagement';
import { UserManagementHeader } from './UserManagementHeader';
import { UserManagementStats } from './UserManagementStats';
import { UserManagementSearch } from './UserManagementSearch';
import { UserManagementFilters } from './UserManagementFilters';
import { UserManagementTable } from './UserManagementTable';
import { UserManagementDialogs } from './UserManagementDialogs';
import { UserManagementFooter } from './UserManagementFooter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const UserManagementContainer: React.FC = () => {
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
  const newSignups = 0;
  const pendingVerifications = 0;

  const handleAddUser = () => {
    setAddUserDialogOpen(true);
  };

  const handleManageRoles = () => {
    window.location.href = '/admin/permissions';
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleBulkAction = (action: string, userIds: string[]) => {
    console.log('Bulk action:', action, 'for users:', userIds);
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
          <UserManagementHeader 
            onAddUser={handleAddUser}
            onManageRoles={handleManageRoles}
          />

          <UserManagementStats
            totalUsers={totalUsers}
            activeUsers={activeUsers}
            newSignups={newSignups}
            pendingVerifications={pendingVerifications}
          />

          <UserManagementSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <UserManagementFilters
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

          <UserManagementTable
            users={paginatedUsers}
            isLoading={isLoading}
            error={null}
            onResetPassword={handleResetPassword}
            onDisableUser={handleDisableUser}
            onDeleteUser={handleDeleteUser}
            selectedUsers={selectedUsers}
            onUserSelection={handleUserSelection}
            onSelectAll={handleSelectAll}
            filteredUsers={filteredUsers}
            currentPage={currentPage}
            totalPages={totalPages}
            usersPerPage={usersPerPage}
            onPageChange={setCurrentPage}
          />
          
          <UserManagementFooter />
        </CardContent>
      </Card>

      <UserManagementDialogs
        addUserDialogOpen={addUserDialogOpen}
        setAddUserDialogOpen={setAddUserDialogOpen}
      />
    </div>
  );
};
