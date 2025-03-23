
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";

interface MarketingStats {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  totalJobs: number;
  totalAddresses: number;
  eligibleAddresses: number;
}

interface MarketingJobStatusCardProps {
  marketingStats: MarketingStats;
}

export const MarketingJobStatusCard: React.FC<MarketingJobStatusCardProps> = ({ marketingStats }) => {
  const marketingStatusChartData = [
    { name: 'Pending', data: marketingStats.pendingJobs },
    { name: 'Processing', data: marketingStats.processingJobs },
    { name: 'Completed', data: marketingStats.completedJobs }
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Marketing Job Status</CardTitle>
        <CardDescription>Current status of marketing campaigns</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="h-60 w-60">
          <Chart type="pie" data={marketingStatusChartData} />
        </div>
      </CardContent>
    </Card>
  );
};
