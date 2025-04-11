
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserTypeCard, 
  MarketingJobStatusCard, 
  MarketingStatsCards, 
  NotificationStatsCard,
  RecentActivityCard, 
  VerificationChallengesCard 
} from '.';
import { ContentManagement } from './ContentManagement';
import { MarketingContent } from '../tools/marketing/MarketingContent';
import { useMarketingDashboardData } from './useMarketingDashboardData';
import { MarketingSidebar } from './MarketingSidebar';
import { BulkAddressSearch } from './BulkAddressSearch';

export const MarketingDashboard: React.FC = () => {
  const { 
    loading, 
    userTypeCounts, 
    marketingStats, 
    recentActivity, 
    notifications, 
    verificationChallenges 
  } = useMarketingDashboardData();
  
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="flex h-full">
      <MarketingSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {activeSection === 'overview' && (
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
        )}
        
        {activeSection === 'search' && (
          <BulkAddressSearch />
        )}
        
        {activeSection === 'content' && (
          <ContentManagement />
        )}
        
        {activeSection === 'create' && (
          <MarketingContent />
        )}
        
        {/* Additional sections will be added for the other menu items as they are implemented */}
        {['jobs', 'lists', 'users', 'notifications', 'properties'].includes(activeSection) && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</CardTitle>
              <CardDescription>This feature is coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section is currently under development. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
