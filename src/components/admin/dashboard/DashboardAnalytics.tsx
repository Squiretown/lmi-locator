
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const DashboardAnalytics = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          Detailed system usage analytics and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <p className="text-sm text-muted-foreground">Analytics will be available soon.</p>
      </CardContent>
    </Card>
  );
};
