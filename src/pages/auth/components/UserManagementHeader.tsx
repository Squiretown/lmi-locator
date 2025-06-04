
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Download } from 'lucide-react';
import { toast } from 'sonner';

interface UserManagementHeaderProps {
  onAddUser: () => void;
  onManageRoles: () => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onAddUser,
  onManageRoles,
}) => {
  const handleExportUsers = () => {
    toast.info('Export functionality will be implemented');
  };

  return (
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
        <Button onClick={onManageRoles} variant="outline">
          Manage Roles
        </Button>
        <Button onClick={onAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>
    </div>
  );
};
