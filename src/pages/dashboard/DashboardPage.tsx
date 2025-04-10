
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>General dashboard for all users. Specific dashboard views will be added for different user types.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
