
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const MarketingSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Marketing List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Find homes located in LMI Tracks
          </p>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Marketing List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Find homes located in LMI Tracks
          </p>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
