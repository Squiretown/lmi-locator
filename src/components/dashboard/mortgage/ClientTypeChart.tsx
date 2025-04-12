
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ClientTypeChart: React.FC = () => {
  const clientData = [
    { name: 'First Time', clients: 7 },
    { name: 'Repeat', clients: 4 },
    { name: 'Investment', clients: 3 },
    { name: 'Refinance', clients: 6 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clients" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
