
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    </Tabs>
  );
};
