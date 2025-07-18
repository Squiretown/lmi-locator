
import React, { useState } from 'react';
import PropertyChecker from '@/components/PropertyChecker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecentSearches } from '@/components/dashboard/mortgage/RecentSearches';
import { ClientSavedProperties } from './ClientSavedProperties';
import { YourTeamCard } from './YourTeamCard';

export const ClientDashboardContent = () => {
  const [activeTab, setActiveTab] = useState('search');

  const handleAddressSelect = (address: string) => {
    // Switch to search tab and let PropertyChecker handle the address
    setActiveTab('search');
    // The PropertyChecker component will need to handle pre-filling the address
    // This could be enhanced later with a prop or context
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6">
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Property Search</TabsTrigger>
              <TabsTrigger value="recent">Recent Searches</TabsTrigger>
              <TabsTrigger value="saved">Saved Properties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="mt-6">
              <PropertyChecker />
            </TabsContent>
            
            <TabsContent value="recent" className="mt-6">
              <RecentSearches />
            </TabsContent>
            
            <TabsContent value="saved" className="mt-6">
              <ClientSavedProperties onAddressSelect={handleAddressSelect} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:sticky lg:top-6 lg:self-start">
          <YourTeamCard />
        </div>
      </div>
    </div>
  );
};
