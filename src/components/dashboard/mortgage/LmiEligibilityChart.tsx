
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useProfessionalLmiStats } from '@/hooks/useProfessionalLmiStats';
import { Skeleton } from '@/components/ui/skeleton';

export const LmiEligibilityChart: React.FC = () => {
  const { stats, isLoading } = useProfessionalLmiStats();
  
  const propertyData = [
    { name: 'LMI Eligible', value: stats.lmiEligibleSearches },
    { name: 'Not Eligible', value: stats.totalSearches - stats.lmiEligibleSearches },
  ];
  
  const COLORS = ['#4ade80', '#f87171'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LMI Eligibility</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (stats.totalSearches === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LMI Eligibility</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-muted-foreground text-center">
            No property searches found yet.<br />
            Start searching for properties to see LMI eligibility data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#888888">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="#888888" fontSize={12}>
          {payload.name}
        </text>
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LMI Eligibility</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={propertyData}
                cx="50%"
                cy="50%"
                activeShape={renderActiveShape}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {propertyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
