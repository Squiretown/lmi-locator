
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";

export interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  byType: Record<string, number>;
}

export interface NotificationStatsCardProps {
  notifications: NotificationStats;
}

export const NotificationStatsCard: React.FC<NotificationStatsCardProps> = ({ notifications }) => {
  // Check if notifications is defined before accessing properties
  if (!notifications) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Notification Statistics</CardTitle>
          <CardDescription>Overview of system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-gray-500">Loading notification data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const notificationTypeChartData = Object.keys(notifications.byType).map(key => ({
    name: key,
    data: notifications.byType[key]
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Notification Statistics</CardTitle>
        <CardDescription>Overview of system notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{notifications.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{notifications.read}</div>
            <div className="text-sm text-gray-500">Read</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{notifications.unread}</div>
            <div className="text-sm text-gray-500">Unread</div>
          </div>
        </div>
        <div className="h-40">
          <Chart type="pie" data={notificationTypeChartData} />
        </div>
      </CardContent>
    </Card>
  );
};
