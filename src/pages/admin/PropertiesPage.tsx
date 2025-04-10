
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PropertiesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Properties Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Property management features will be added soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertiesPage;
