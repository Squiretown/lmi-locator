
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { MarketingContent } from '../tools/MarketingContent';
import { useMarketingDashboardData } from './useMarketingDashboardData';

export const MarketingDashboard: React.FC = () => {
  const { 
    loading, 
    userTypeCounts, 
    marketingStats, 
    recentActivity, 
    notifications, 
    verificationChallenges 
  } = useMarketingDashboardData();

  return (
    <div className="space-y-4 p-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="create">Create Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MarketingStatsCards stats={marketingStats} loading={loading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MarketingJobStatusCard stats={marketingStats} loading={loading} />
            <UserTypeCard userTypeCounts={userTypeCounts} loading={loading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NotificationStatsCard notifications={notifications} loading={loading} />
            <RecentActivityCard recentActivity={recentActivity} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Verification Challenges</CardTitle>
              <CardDescription>Manage verification challenges for user authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationChallengesCard challenges={verificationChallenges} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>
        
        <TabsContent value="create">
          <MarketingContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};
