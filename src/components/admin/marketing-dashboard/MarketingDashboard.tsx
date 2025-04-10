
import React, { useState } from 'react';
import { useMarketingDashboardData } from './useMarketingDashboardData';
import { MarketingStatsCards } from './MarketingStatsCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserTypeCard } from './UserTypeCard';
import { MarketingJobStatusCard } from './MarketingJobStatusCard';
import { NotificationStatsCard } from './NotificationStatsCard';
import { RecentActivityCard } from './RecentActivityCard';
import { VerificationChallengesCard } from './VerificationChallengesCard';
import { MarketingContent } from '../tools/MarketingContent';
import { FileText, BarChart } from 'lucide-react';

export const MarketingDashboard: React.FC = () => {
  const { loading, userTypeCounts, marketingStats, recentActivity, notifications, verificationChallenges } = useMarketingDashboardData();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  if (loading) {
    return <div>Loading marketing dashboard data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
        <p className="text-muted-foreground">Manage marketing campaigns and content</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Content Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <MarketingStatsCards marketingStats={marketingStats} />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <UserTypeCard userTypeCounts={userTypeCounts} />
            <MarketingJobStatusCard marketingStats={marketingStats} />
            <NotificationStatsCard notifications={notifications} />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <RecentActivityCard recentActivity={recentActivity} />
            <VerificationChallengesCard challenges={verificationChallenges} />
          </div>
        </TabsContent>

        <TabsContent value="content">
          <MarketingContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingDashboard;
