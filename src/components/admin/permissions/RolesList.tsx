import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Crown, UserCheck, User, Plus } from 'lucide-react';

interface RolesListProps {
  selectedRole: string | null;
  onRoleSelect: (role: string) => void;
  onCreateRole: () => void;
}

const roles = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    icon: Crown,
    color: 'bg-red-100 text-red-700',
    userCount: 2
  },
  {
    id: 'mortgage_professional',
    name: 'Mortgage Professional',
    description: 'Manage properties, contacts, and marketing campaigns',
    icon: UserCheck,
    color: 'bg-blue-100 text-blue-700',
    userCount: 15
  },
  {
    id: 'realtor',
    name: 'Realtor',
    description: 'Manage properties and client relationships',
    icon: Users,
    color: 'bg-green-100 text-green-700',
    userCount: 23
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Basic access to search and view properties',
    icon: User,
    color: 'bg-gray-100 text-gray-700',
    userCount: 145
  }
];

export const RolesList: React.FC<RolesListProps> = ({
  selectedRole,
  onRoleSelect,
  onCreateRole
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          User Roles
          <Button size="sm" variant="outline" onClick={onCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </CardTitle>
        <CardDescription>
          Manage user roles and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <div
              key={role.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-muted-foreground/20'
              }`}
              onClick={() => onRoleSelect(role.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${role.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{role.name}</h3>
                      {isSelected && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{role.userCount}</div>
                  <div className="text-xs text-muted-foreground">users</div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};