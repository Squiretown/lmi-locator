
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from './components/settings/ProfileSettings';
import SecuritySettings from './components/settings/SecuritySettings';

const SettingsPage: React.FC = () => {
  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
