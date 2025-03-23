
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketingStats {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  totalJobs: number;
  totalAddresses: number;
  eligibleAddresses: number;
}

interface MarketingStatsCardsProps {
  marketingStats: MarketingStats;
}

export const MarketingStatsCards: React.FC<MarketingStatsCardsProps> = ({ marketingStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Marketing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{marketingStats.totalJobs}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{marketingStats.totalAddresses}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Eligible Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{marketingStats.eligibleAddresses}</div>
          <div className="text-sm text-gray-500">
            {marketingStats.totalAddresses ? 
              `${Math.round((marketingStats.eligibleAddresses / marketingStats.totalAddresses) * 100)}%` : 
              '0%'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
