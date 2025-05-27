
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserTypeCard, 
  MarketingJobStatusCard, 
  MarketingStatsCards, 
  NotificationStatsCard,
  RecentActivityCard, 
  VerificationChallengesCard,
  ContentManagement 
} from './index';
import { MapView } from './map-view';
import { useMarketingDashboardData } from './useMarketingDashboardData';
import { MarketingSidebar } from './MarketingSidebar';
import { BulkAddressSearch } from './bulk-search/BulkAddressSearch';

// Component for the "Coming Soon" placeholder card
const ComingSoonSection = ({ title }: { title: string }) => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>This feature is coming soon</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        This section is currently under development. Please check back later.
      </p>
    </CardContent>
  </Card>
);

// Overview section component
const OverviewSection = ({ 
  marketingStats, 
  userTypeCounts, 
  notifications, 
  recentActivity, 
  verificationChallenges 
}: ReturnType<typeof useMarketingDashboardData>) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MarketingStatsCards marketingStats={marketingStats} />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MarketingJobStatusCard marketingStats={marketingStats} />
      <UserTypeCard userTypeCounts={userTypeCounts} />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NotificationStatsCard notifications={notifications} />
      <RecentActivityCard recentActivity={recentActivity} />
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Verification Challenges</CardTitle>
        <CardDescription>Manage verification challenges for user authentication</CardDescription>
      </CardHeader>
      <CardContent>
        <VerificationChallengesCard challenges={verificationChallenges} />
      </CardContent>
    </Card>
  </>
);

export const MarketingDashboard: React.FC = () => {
  const dashboardData = useMarketingDashboardData();
  const [activeSection, setActiveSection] = useState('overview');

  // Render the appropriate section based on the active section state
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection {...dashboardData} />;
      case 'search':
        return <BulkAddressSearch />;
      case 'map':
        return <MapView />;
      case 'content':
        return <ContentManagement />;
      case 'create':
        return <ComingSoonSection title="Create Content" />;
      default:
        // For unimplemented sections, show a "coming soon" message
        if (['jobs', 'lists', 'users', 'notifications', 'properties'].includes(activeSection)) {
          return <ComingSoonSection title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} />;
        }
        return null;
    }
  };

  return (
    <div className="flex h-full">
      <MarketingSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {renderSection()}
      </div>
    </div>
  );
};
