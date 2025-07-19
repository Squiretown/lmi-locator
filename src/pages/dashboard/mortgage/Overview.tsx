
import React from 'react';
import { DashboardStats } from '@/components/dashboard/mortgage/DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MortgageOverview: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Mortgage Professional Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your mortgage portal</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your recent client interactions and loan applications will appear here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Quick access to common mortgage workflows and tools.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MortgageOverview;
