
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, ResponsiveContainer } from 'recharts';

const propertyData = [
  { name: 'Jan', searches: 4 },
  { name: 'Feb', searches: 7 },
  { name: 'Mar', searches: 5 },
  { name: 'Apr', searches: 12 },
  { name: 'May', searches: 9 },
  { name: 'Jun', searches: 14 },
];

export const PropertyActivityChart = () => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Property Search Activity</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={propertyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="searches" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
