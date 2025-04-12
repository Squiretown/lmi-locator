
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingApplications } from './PendingApplications';
import { ActiveApplications } from './ActiveApplications';
import { CompletedApplications } from './CompletedApplications';

export const ApplicationTabs: React.FC = () => {
  return (
    <Tabs defaultValue="pending">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Pending (5)</TabsTrigger>
        <TabsTrigger value="active">Active (7)</TabsTrigger>
        <TabsTrigger value="completed">Completed (8)</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="p-0 mt-4">
        <PendingApplications />
      </TabsContent>
      
      <TabsContent value="active" className="p-0 mt-4">
        <ActiveApplications />
      </TabsContent>
      
      <TabsContent value="completed" className="p-0 mt-4">
        <CompletedApplications />
      </TabsContent>
    </Tabs>
  );
};
