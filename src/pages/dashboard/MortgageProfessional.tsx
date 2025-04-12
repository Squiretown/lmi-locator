
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMortgageDashboard } from '@/hooks/useMortgageDashboard';
import {
  DashboardHeader,
  StatCards,
  LmiEligibilityChart,
  ClientTypeChart,
  RecentSearches,
  MarketingLists,
  ApplicationTabs,
  LmiSearchTab
} from '@/components/dashboard/mortgage';

const MortgageProfessionalDashboard: React.FC = () => {
  const { activeTab, setActiveTab, signOut, handleExportResults } = useMortgageDashboard();

  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardHeader onSignOut={signOut} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lmi-search">LMI Search</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <StatCards />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LmiEligibilityChart />
            <ClientTypeChart />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentSearches />
            <MarketingLists />
          </div>
        </TabsContent>
        
        <TabsContent value="lmi-search" className="h-[calc(100vh-200px)]">
          <LmiSearchTab onExportResults={handleExportResults} />
        </TabsContent>
        
        <TabsContent value="applications">
          <ApplicationTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MortgageProfessionalDashboard;
