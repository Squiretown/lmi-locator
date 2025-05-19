
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const DashboardActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Comprehensive list of recent system activities
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <p className="text-sm text-muted-foreground">Detailed activity log will be available soon.</p>
      </CardContent>
    </Card>
  );
};
