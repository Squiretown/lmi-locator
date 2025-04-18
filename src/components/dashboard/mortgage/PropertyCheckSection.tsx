
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const PropertyCheckSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Check If A Property Is Eligible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Find out if a property is in an LMI area and discover available assistance programs
          </p>
          <Button>Check Property</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Check New LMI Area Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Find New listings that are located in an LMI Track
          </p>
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
