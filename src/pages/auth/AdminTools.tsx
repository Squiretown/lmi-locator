
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement, ApiKeys, SystemLogs, DatabaseTools } from "@/components/admin/tools";
import { Database, FileText, Key, Users, Trash2, TestTube } from "lucide-react";
import RemoveAllUsers from '@/components/admin/RemoveAllUsers';
import ConnectionTester from '@/components/development/ConnectionTester';

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
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-1">
                <TestTube className="h-4 w-4" />
                Testing
              </TabsTrigger>
              <TabsTrigger value="danger-zone" className="flex items-center gap-1 text-red-600">
                <Trash2 className="h-4 w-4" />
                Danger
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
            
            {/* Testing Tab */}
            <TabsContent value="testing">
              <ConnectionTester />
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
