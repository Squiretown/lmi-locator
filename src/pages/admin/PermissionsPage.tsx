
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, Search, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

const PermissionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditPermissionOpen, setIsEditPermissionOpen] = useState(false);

  // Mock data
  const roles = [
    { id: '1', name: 'admin', description: 'Full system access', userCount: 2, permissions: ['view_all_users', 'manage_users', 'system_admin'] },
    { id: '2', name: 'mortgage_professional', description: 'Mortgage broker access', userCount: 15, permissions: ['view_analytics', 'manage_properties'] },
    { id: '3', name: 'realtor', description: 'Real estate agent access', userCount: 8, permissions: ['view_analytics', 'manage_contacts'] },
    { id: '4', name: 'client', description: 'Basic user access', userCount: 142, permissions: ['view_own_searches'] },
  ];

  const permissions = [
    { id: '1', name: 'view_all_users', description: 'View all users in the system', category: 'User Management' },
    { id: '2', name: 'manage_users', description: 'Create, update, and delete users', category: 'User Management' },
    { id: '3', name: 'system_admin', description: 'Full system administration access', category: 'System' },
    { id: '4', name: 'view_analytics', description: 'View analytics and reports', category: 'Analytics' },
    { id: '5', name: 'manage_properties', description: 'Manage property listings', category: 'Properties' },
    { id: '6', name: 'manage_contacts', description: 'Manage contact information', category: 'Contacts' },
    { id: '7', name: 'view_own_searches', description: 'View own search history', category: 'Searches' },
  ];

  const handleAddRole = () => {
    toast.success("Role added successfully");
    setIsAddRoleOpen(false);
  };

  const handleEditPermission = () => {
    toast.success("Permission updated successfully");
    setIsEditPermissionOpen(false);
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Permissions Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions across the system
                </CardDescription>
              </div>
            </div>
            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Role</DialogTitle>
                  <DialogDescription>
                    Create a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input id="roleName" placeholder="Enter role name" />
                  </div>
                  <div>
                    <Label htmlFor="roleDescription">Description</Label>
                    <Input id="roleDescription" placeholder="Enter role description" />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <input type="checkbox" id={permission.id} />
                          <Label htmlFor={permission.id} className="text-sm">{permission.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRole}>Create Role</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="roles" className="space-y-4">
            <TabsList>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="users">User Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="roles">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{role.userCount} users</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 2).map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                            {role.permissions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      className="max-w-sm"
                    />
                  </div>
                  <Dialog open={isEditPermissionOpen} onOpenChange={setIsEditPermissionOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Permission
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Permission</DialogTitle>
                        <DialogDescription>
                          Create a new permission for the system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="permissionName">Permission Name</Label>
                          <Input id="permissionName" placeholder="e.g., manage_reports" />
                        </div>
                        <div>
                          <Label htmlFor="permissionDescription">Description</Label>
                          <Input id="permissionDescription" placeholder="Brief description of what this permission allows" />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user-management">User Management</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                              <SelectItem value="analytics">Analytics</SelectItem>
                              <SelectItem value="properties">Properties</SelectItem>
                              <SelectItem value="contacts">Contacts</SelectItem>
                              <SelectItem value="searches">Searches</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditPermissionOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleEditPermission}>Create Permission</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {['User Management', 'System', 'Analytics', 'Properties', 'Contacts', 'Searches'].map((category) => (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {permissions
                            .filter(p => p.category === category)
                            .map((permission) => (
                              <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-sm text-muted-foreground">{permission.description}</div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="max-w-sm"
                  />
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="mortgage_professional">Mortgage Professional</SelectItem>
                      <SelectItem value="realtor">Realtor</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">User Role Assignments</h3>
                      <p className="text-muted-foreground mb-4">
                        Manage user role assignments and permissions
                      </p>
                      <Button>View User Management</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsPage;
