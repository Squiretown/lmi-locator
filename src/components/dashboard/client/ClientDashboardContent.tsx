
import React, { useState } from 'react';
import PropertyChecker from '@/components/PropertyChecker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecentSearches } from '@/components/dashboard/mortgage/RecentSearches';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

export const ClientDashboardContent = () => {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Property Search</TabsTrigger>
          <TabsTrigger value="recent">Recent Searches</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-6">
          <PropertyChecker />
        </TabsContent>
        
        <TabsContent value="recent" className="mt-6">
          <RecentSearches />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};
