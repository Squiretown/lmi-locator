
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Overview } from "./Overview";
import { RecentActivity } from "./RecentActivity";

interface DashboardOverviewProps {
  isLoading: boolean;
  searchHistory: any[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ isLoading, searchHistory }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <Overview />
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Recent system activity across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity 
            isLoading={isLoading} 
            activities={searchHistory || []} 
          />
        </CardContent>
      </Card>
    </div>
  );
};
