
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  addPermissionToBroker, 
  removePermissionFromBroker 
} from '@/lib/api/brokers';

interface BrokerPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brokerId: string;
  initialPermissions: string[];
}

const BrokerPermissionsDialog: React.FC<BrokerPermissionsDialogProps> = ({
  isOpen,
  onClose,
  brokerId,
  initialPermissions,
}) => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // List of available permissions
  const allPermissions = [
    'view_properties',
    'edit_properties',
    'view_clients',
    'edit_clients',
    'view_reports',
    'send_marketing'
  ];

  useEffect(() => {
    // Initialize permissions based on what the broker already has
    const permissionsState: Record<string, boolean> = {};
    
    allPermissions.forEach(permission => {
      permissionsState[permission] = initialPermissions.includes(permission);
    });
    
    setPermissions(permissionsState);
  }, [initialPermissions]);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  const savePermissions = async () => {
    setIsLoading(true);
    try {
      const promises = [];
      
      // Find permissions to add (currently true but not in initialPermissions)
      for (const [perm, isEnabled] of Object.entries(permissions)) {
        if (isEnabled && !initialPermissions.includes(perm)) {
          promises.push(addPermissionToBroker(brokerId, perm));
        } else if (!isEnabled && initialPermissions.includes(perm)) {
          promises.push(removePermissionFromBroker(brokerId, perm));
        }
      }
      
      await Promise.all(promises);
      
      toast({
        title: 'Success',
        description: 'Permissions updated successfully',
        duration: 3000
      });
      
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update permissions',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Broker Permissions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {allPermissions.map((permission) => (
            <div className="flex items-center space-x-2" key={permission}>
              <Checkbox 
                id={permission}
                checked={permissions[permission]}
                onCheckedChange={(checked) => 
                  handlePermissionChange(permission, checked as boolean)
                }
              />
              <label 
                htmlFor={permission}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {permission.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={savePermissions} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerPermissionsDialog;
