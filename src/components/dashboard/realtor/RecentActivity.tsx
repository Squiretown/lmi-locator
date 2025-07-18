import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClientActivity } from '@/hooks/useClientActivity';

export const RecentActivity: React.FC = () => {
  const { activities } = useClientActivity();

  const recentActivities = activities.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          recentActivities.map((activity, index) => (
            <div key={index} className="space-y-2">
              <div className="font-medium text-sm">{activity.address}</div>
              <div className="flex items-center gap-2">
                <Badge variant={activity.result === 'eligible' ? 'default' : 'secondary'}>
                  {activity.result === 'eligible' ? 'Eligible' : 'Eligible'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  This property is in an LMI eligible area
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};