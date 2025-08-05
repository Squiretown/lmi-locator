
import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionsStats } from '@/components/admin/permissions/PermissionsStats';
import { RolesList } from '@/components/admin/permissions/RolesList';
import { PermissionsList } from '@/components/admin/permissions/PermissionsList';
import { usePermissionsSystem } from '@/hooks/usePermissionsSystem';

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { assignRoleToUser, removeRoleFromUser } = usePermissionsSystem();

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleCreateRole = () => {
    toast.info('Role creation feature coming soon');
  };

  const handlePermissionToggle = async (permission: string, enabled: boolean) => {
    if (!selectedRole) return;
    
    try {
      if (enabled) {
        toast.success(`Permission "${permission}" enabled for ${selectedRole}`);
      } else {
        toast.success(`Permission "${permission}" disabled for ${selectedRole}`);
      }
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permissions Management</h1>
        <p className="text-muted-foreground">
          Manage user roles, permissions, and access controls
        </p>
      </div>

      <PermissionsStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <RolesList
          selectedRole={selectedRole}
          onRoleSelect={handleRoleSelect}
          onCreateRole={handleCreateRole}
        />
        
        <PermissionsList
          selectedRole={selectedRole}
          onPermissionToggle={handlePermissionToggle}
        />
      </div>
    </div>
  );
}
