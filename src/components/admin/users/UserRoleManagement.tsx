import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Crown, UserCheck, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissionsSystem } from '@/hooks/usePermissionsSystem';
import type { AdminUser } from '@/pages/auth/types/admin-user';

interface UserRoleManagementProps {
  user: AdminUser;
  onRoleUpdate?: () => void;
}

const roleOptions = [
  { 
    value: 'admin', 
    label: 'Administrator', 
    icon: Crown, 
    color: 'bg-red-100 text-red-700',
    description: 'Full system access with all permissions'
  },
  { 
    value: 'mortgage_professional', 
    label: 'Mortgage Professional', 
    icon: UserCheck, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Manage properties, contacts, and marketing'
  },
  { 
    value: 'realtor', 
    label: 'Realtor', 
    icon: Users, 
    color: 'bg-green-100 text-green-700',
    description: 'Manage properties and client relationships'
  },
  { 
    value: 'client', 
    label: 'Client', 
    icon: User, 
    color: 'bg-gray-100 text-gray-700',
    description: 'Basic access to search and view properties'
  }
];

export const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  user,
  onRoleUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { assignRoleToUser, hasPermission } = usePermissionsSystem();

  const currentRole = user.user_metadata?.user_type || 'client';
  const currentRoleOption = roleOptions.find(option => option.value === currentRole);

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const { success, error } = await assignRoleToUser(user.id, selectedRole);

      if (success) {
        toast.success(`User role updated to ${selectedRole}`);
        await onRoleUpdate?.();
        setIsOpen(false);
      } else {
        toast.error(error?.message || 'Failed to update user role');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating the role';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if current user has permission to manage roles
  if (!hasPermission('manage_users')) {
    return (
      <Badge variant="outline" className={currentRoleOption?.color}>
        {currentRoleOption?.label || currentRole}
      </Badge>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent"
        >
          <Badge variant="outline" className={`${currentRoleOption?.color} cursor-pointer hover:opacity-80`}>
            <Settings className="h-3 w-3 mr-1" />
            {currentRoleOption?.label || currentRole}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.user_metadata?.first_name} {user.user_metadata?.last_name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Role</label>
            <div className="flex items-center gap-2">
              {currentRoleOption && (
                <>
                  <div className={`p-2 rounded-lg ${currentRoleOption.color}`}>
                    <currentRoleOption.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{currentRoleOption.label}</div>
                    <div className="text-sm text-muted-foreground">{currentRoleOption.description}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a new role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${option.color}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedRole && selectedRole !== currentRole && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Role Change Impact</h4>
              <p className="text-sm text-muted-foreground">
                This will immediately change the user's permissions and access level. 
                They may need to sign in again to see the changes.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRoleChange} 
            disabled={!selectedRole || selectedRole === currentRole || isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};