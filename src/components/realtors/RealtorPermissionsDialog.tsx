
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Save } from 'lucide-react';
import { RealtorPermissionTable } from '@/lib/api/database-types';

interface Permission {
  name: string;
  description: string;
  granted: boolean;
}

interface RealtorPermissionsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  realtorId: string;
  realtorName: string;
}

const RealtorPermissionsDialog: React.FC<RealtorPermissionsDialogProps> = ({
  isOpen,
  setIsOpen,
  realtorId,
  realtorName,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([
    { name: 'view_clients', description: 'View client information', granted: false },
    { name: 'edit_clients', description: 'Edit client information', granted: false },
    { name: 'send_marketing', description: 'Send marketing materials', granted: false },
    { name: 'view_properties', description: 'View property listings', granted: false },
    { name: 'access_reports', description: 'Access analytics reports', granted: false },
    { name: 'manage_listings', description: 'Manage property listings', granted: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current realtor permissions when dialog opens
  useEffect(() => {
    if (isOpen && realtorId) {
      fetchRealtorPermissions();
    }
  }, [isOpen, realtorId]);

  const fetchRealtorPermissions = async () => {
    try {
      setIsLoading(true);
      // We're using a type assertion here since the table might not be in the Supabase types
      const { data, error } = await supabase
        .from('realtor_permissions')
        .select('permission_name')
        .eq('realtor_id', realtorId) as unknown as { 
          data: Pick<RealtorPermissionTable, 'permission_name'>[] | null; 
          error: Error | null;
        };

      if (error) throw error;

      // Update permissions state based on fetched data
      const grantedPermissions = data?.map(p => p.permission_name as string) || [];
      
      setPermissions(permissions.map(permission => ({
        ...permission,
        granted: grantedPermissions.includes(permission.name)
      })));
    } catch (error) {
      console.error('Error fetching realtor permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (name: string) => {
    setPermissions(
      permissions.map(permission =>
        permission.name === name
          ? { ...permission, granted: !permission.granted }
          : permission
      )
    );
  };

  const savePermissions = async () => {
    try {
      setIsLoading(true);

      // First delete all existing permissions for this realtor
      const { error: deleteError } = await supabase
        .from('realtor_permissions')
        .delete()
        .eq('realtor_id', realtorId) as unknown as { error: Error | null };

      if (deleteError) throw deleteError;

      // Then insert new permissions
      const grantedPermissions = permissions
        .filter(p => p.granted)
        .map(p => ({
          realtor_id: realtorId,
          permission_name: p.name,
        }));

      if (grantedPermissions.length > 0) {
        const { error: insertError } = await supabase
          .from('realtor_permissions')
          .insert(grantedPermissions) as unknown as { error: Error | null };

        if (insertError) throw insertError;
      }

      toast.success('Permissions updated successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Manage Permissions: {realtorName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {permissions.map((permission) => (
            <div key={permission.name} className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded">
              <Checkbox 
                id={permission.name}
                checked={permission.granted}
                onCheckedChange={() => togglePermission(permission.name)}
                disabled={isLoading}
              />
              <div className="grid gap-1.5">
                <label
                  htmlFor={permission.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {permission.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
                <p className="text-sm text-gray-500">{permission.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={savePermissions} disabled={isLoading} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{isLoading ? 'Saving...' : 'Save Permissions'}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RealtorPermissionsDialog;
