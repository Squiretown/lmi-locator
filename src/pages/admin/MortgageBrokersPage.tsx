
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

const MortgageBrokersPage: React.FC = () => {
  return (
    <Card className="m-4">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6" />
          <CardTitle>Mortgage Brokers Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          Mortgage Brokers management functionality coming soon.
        </div>
      </CardContent>
    </Card>
  );
};

export default MortgageBrokersPage;
