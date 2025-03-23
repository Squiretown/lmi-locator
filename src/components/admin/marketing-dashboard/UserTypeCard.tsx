
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";

interface UserTypeCardProps {
  userTypeCounts: Record<string, number>;
}

export const UserTypeCard: React.FC<UserTypeCardProps> = ({ userTypeCounts }) => {
  const userTypeChartData = Object.keys(userTypeCounts).map(key => ({
    name: key,
    data: userTypeCounts[key]
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>User Types</CardTitle>
        <CardDescription>Distribution of users by type</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="h-60 w-60">
          <Chart type="pie" data={userTypeChartData} />
        </div>
      </CardContent>
    </Card>
  );
};
