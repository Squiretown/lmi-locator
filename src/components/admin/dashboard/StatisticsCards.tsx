
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, TrendingUp, Shield } from "lucide-react";

interface StatisticsCardsProps {
  isLoading: boolean;
  userCount: number;
  propertyCount: number;
  realtorCount: number;
  mortgageBrokerCount: number;
  clientCount?: number;
  adminCount?: number;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  isLoading,
  userCount,
  propertyCount,
  realtorCount,
  mortgageBrokerCount,
  clientCount = 0,
  adminCount = 0
}) => {
  const LoadingCard = ({ title, icon: Icon }: { title: string; icon: React.ComponentType<any> }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
        </p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LoadingCard title="Total Users" icon={Users} />
        <LoadingCard title="Properties" icon={Home} />
        <LoadingCard title="Active Realtors" icon={TrendingUp} />
        <LoadingCard title="Mortgage Brokers" icon={Shield} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
          <p className="text-xs text-muted-foreground">
            {adminCount} admin, {realtorCount} realtors, {mortgageBrokerCount} brokers, {clientCount} clients
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{propertyCount}</div>
          <p className="text-xs text-muted-foreground">Listed properties</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Realtors</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{realtorCount}</div>
          <p className="text-xs text-muted-foreground">Registered realtors</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mortgage Brokers</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mortgageBrokerCount}</div>
          <p className="text-xs text-muted-foreground">Active brokers</p>
        </CardContent>
      </Card>
    </div>
  );
};
