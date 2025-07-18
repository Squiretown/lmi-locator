import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainPropertyChecker from '../../PropertyChecker';

export const PropertyChecker: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Checker</CardTitle>
        <p className="text-sm text-muted-foreground">Enter an address to check LMI eligibility</p>
      </CardHeader>
      <CardContent>
        <MainPropertyChecker />
      </CardContent>
    </Card>
  );
};