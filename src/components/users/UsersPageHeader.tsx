
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Shield } from 'lucide-react';

interface UsersPageHeaderProps {
  onAddClick: () => void;
  onManageRolesClick: () => void;
}

export const UsersPageHeader: React.FC<UsersPageHeaderProps> = ({
  onAddClick,
  onManageRolesClick,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-muted-foreground">Manage users and their access permissions</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onManageRolesClick} variant="outline">
          <Shield className="mr-2 h-4 w-4" />
          Manage Roles
        </Button>
        <Button onClick={onAddClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>
    </div>
  );
};
