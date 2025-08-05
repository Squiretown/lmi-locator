import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Shield } from 'lucide-react';
import { usePermissionsSystem } from '@/hooks/usePermissionsSystem';

interface PermissionsListProps {
  selectedRole: string | null;
  onPermissionToggle: (permission: string, enabled: boolean) => void;
}

export const PermissionsList: React.FC<PermissionsListProps> = ({
  selectedRole,
  onPermissionToggle
}) => {
  const { permissions, allPermissions, hasPermission } = usePermissionsSystem();

  const permissionCategories = {
    admin: ['view_all_users', 'manage_users', 'view_user_management', 'sign_out_all_users', 'remove_all_users', 'manage_system_settings'],
    analytics: ['view_analytics'],
    data: ['export_data'],
    properties: ['manage_properties'],
    searches: ['view_all_searches', 'view_own_searches'],
    marketing: ['manage_marketing_campaigns'],
    notifications: ['view_notifications', 'manage_notifications'],
    contacts: ['manage_contacts']
  };

  const getCategoryPermissions = (category: string) => {
    return permissionCategories[category as keyof typeof permissionCategories] || [];
  };

  const isPermissionEnabled = (permissionName: string) => {
    if (!selectedRole) return false;
    // For now, check if the current user has this permission as a proxy
    return hasPermission(permissionName);
  };

  if (!selectedRole) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Select a role to view and manage its permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No role selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Permissions for {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Permission
            </Button>
          </CardTitle>
          <CardDescription>
            Configure what actions users with this role can perform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {category}
              </h4>
              <div className="space-y-2">
                {categoryPermissions.map((permission) => (
                  <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <Badge variant={isPermissionEnabled(permission) ? "default" : "secondary"}>
                          {isPermissionEnabled(permission) ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getPermissionDescription(permission)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isPermissionEnabled(permission)}
                        onCheckedChange={(checked) => onPermissionToggle(permission, checked)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    'view_all_users': 'View all users in the system',
    'manage_users': 'Create, update, and delete user accounts',
    'view_analytics': 'Access analytics and reporting features',
    'manage_system_settings': 'Configure system-wide settings',
    'export_data': 'Export data from the system',
    'manage_properties': 'Add, edit, and remove property listings',
    'view_all_searches': 'View search history from all users',
    'view_own_searches': 'View only own search history',
    'manage_marketing_campaigns': 'Create and manage marketing campaigns',
    'view_notifications': 'View notifications',
    'manage_notifications': 'Manage notification settings',
    'view_user_management': 'Access user management interface',
    'sign_out_all_users': 'Sign out all users from the system',
    'remove_all_users': 'Remove all users from the system',
    'manage_contacts': 'Manage contact lists and interactions'
  };
  
  return descriptions[permission] || 'Permission description not available';
}