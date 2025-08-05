import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, History, Settings } from 'lucide-react';
import { UserManagementContainer } from '@/pages/auth/components/UserManagementContainer';
import { RoleChangeAuditLog } from '@/components/admin/RoleChangeAuditLog';

const RoleManagement: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and track all role changes across the system
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Role Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Role Management
              </CardTitle>
              <CardDescription>
                View, search, and modify user roles. Use the enhanced role change dialogs for comprehensive tracking and validation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementContainer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <RoleChangeAuditLog />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Role Configuration
              </CardTitle>
              <CardDescription>
                Configure role definitions, permissions, and system-wide role settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Available Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Client</h4>
                            <p className="text-sm text-muted-foreground">Basic user access</p>
                          </div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Realtor</h4>
                            <p className="text-sm text-muted-foreground">Real estate professional</p>
                          </div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Mortgage Professional</h4>
                            <p className="text-sm text-muted-foreground">Mortgage and lending professional</p>
                          </div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Admin</h4>
                            <p className="text-sm text-muted-foreground">Full system access</p>
                          </div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Role Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Users</span>
                          <span className="font-medium">--</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Clients</span>
                          <span className="font-medium">--</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Realtors</span>
                          <span className="font-medium">--</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Mortgage Professionals</span>
                          <span className="font-medium">--</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Admins</span>
                          <span className="font-medium">--</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleManagement;