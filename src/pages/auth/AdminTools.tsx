
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement, ApiKeys, SystemLogs, DatabaseTools } from "@/components/admin/tools";
import { Database, FileText, Key, Users, Trash2 } from "lucide-react";
import RemoveAllUsers from '@/components/admin/RemoveAllUsers';

const AdminTools: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Tools</CardTitle>
          <CardDescription>
            Administrative tools for managing the system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                System Logs
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Database Tools
              </TabsTrigger>
              <TabsTrigger value="danger-zone" className="flex items-center gap-1 text-red-600">
                <Trash2 className="h-4 w-4" />
                Danger Zone
              </TabsTrigger>
            </TabsList>
            
            {/* User Management Tab */}
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            
            {/* API Keys Tab */}
            <TabsContent value="api-keys">
              <ApiKeys />
            </TabsContent>
            
            {/* System Logs Tab */}
            <TabsContent value="logs">
              <SystemLogs />
            </TabsContent>
            
            {/* Database Tools Tab */}
            <TabsContent value="database">
              <DatabaseTools />
            </TabsContent>
            
            {/* Danger Zone Tab */}
            <TabsContent value="danger-zone">
              <div className="space-y-6">
                <RemoveAllUsers />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="text-xs text-muted-foreground">
          These operations require admin privileges and all actions are logged for security purposes.
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminTools;
