
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to LMI Check</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the home page of the application. More content will be added soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
