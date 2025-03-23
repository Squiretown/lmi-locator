
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

interface RecentActivityCardProps {
  recentActivity: ActivityItem[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ recentActivity }) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="border-b pb-2">
              <div className="font-medium">{activity.activity_type}</div>
              <div className="text-sm">{activity.description}</div>
              <div className="text-sm text-gray-500">
                {new Date(activity.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
