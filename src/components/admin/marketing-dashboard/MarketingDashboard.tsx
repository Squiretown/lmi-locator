
import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserTypeCard } from './UserTypeCard';
import { NotificationStatsCard } from './NotificationStatsCard';
import { MarketingStatsCards } from './MarketingStatsCards';
import { MarketingJobStatusCard } from './MarketingJobStatusCard';
import { RecentActivityCard } from './RecentActivityCard';
import { VerificationChallengesCard } from './VerificationChallengesCard';
import { useMarketingDashboardData } from './useMarketingDashboardData';

export const MarketingDashboard = () => {
  const { 
    loading, 
    userTypeCounts, 
    marketingStats, 
    recentActivity, 
    notifications, 
    verificationChallenges 
  } = useMarketingDashboardData();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
      
      {/* User Types and Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserTypeCard userTypeCounts={userTypeCounts} />
        <NotificationStatsCard notifications={notifications} />
      </div>

      {/* Marketing Stats Cards */}
      <MarketingStatsCards marketingStats={marketingStats} />

      {/* Marketing Job Status and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MarketingJobStatusCard marketingStats={marketingStats} />
        <RecentActivityCard recentActivity={recentActivity} />
      </div>

      {/* Verification Challenges */}
      <VerificationChallengesCard challenges={verificationChallenges} />
    </div>
  );
};
