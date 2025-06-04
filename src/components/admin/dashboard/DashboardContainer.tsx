
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatisticsCards } from "./StatisticsCards";
import { DashboardOverview } from "./DashboardOverview";
import { RecentActivity } from "./RecentActivity";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { DashboardActivity } from "./DashboardActivity";
import { useDashboardData } from "./hooks/useDashboardData";
import { AlertBox } from "./AlertBox";

export const Dashboard = () => {
  const { 
    stats, 
    isLoading, 
    error, 
    usingMockData, 
    handleRetry 
  } = useDashboardData();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        
        <Button 
          variant="outline" 
          onClick={handleRetry}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <AlertBox 
          type="error"
          icon={<AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />}
          title="Note"
          message={error} 
          showDemoDataMessage={usingMockData}
        />
      )}
      
      {usingMockData && !error && (
        <AlertBox 
          type="info"
          icon={<AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />}
          title="Using Demo Data"
          message="Currently displaying sample data. Click refresh to try loading real data."
        />
      )}
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <StatisticsCards 
            isLoading={isLoading} 
            userCount={stats.userCount} 
            propertyCount={stats.propertyCount} 
            realtorCount={stats.realtorCount}
            mortgageBrokerCount={stats.mortgageBrokerCount}
            clientCount={stats.clientCount}
            adminCount={stats.adminCount}
          />
          
          <DashboardOverview 
            isLoading={isLoading} 
            searchHistory={stats.searchHistory} 
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <DashboardAnalytics />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <DashboardActivity />
        </TabsContent>
      </Tabs>
    </div>
  );
};
