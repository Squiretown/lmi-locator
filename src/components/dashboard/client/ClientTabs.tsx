
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientDashboardContent } from '@/components/dashboard/client/ClientDashboardContent';
import { JourneyTrackerContent } from '@/components/dashboard/client/JourneyTrackerContent';
import { TeamContent } from '@/components/dashboard/client/TeamContent';

interface ClientTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const ClientTabs: React.FC<ClientTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs defaultValue="dashboard" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="journey">Journey Tracker</TabsTrigger>
        <TabsTrigger value="team">Your Team</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard">
        <ClientDashboardContent />
      </TabsContent>
      
      <TabsContent value="journey">
        <JourneyTrackerContent />
      </TabsContent>
      
      <TabsContent value="team">
        <TeamContent />
      </TabsContent>
    </Tabs>
  );
};
