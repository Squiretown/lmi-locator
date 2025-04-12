
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Download } from 'lucide-react';

export const MarketingLists: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Lists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">Flyer Campaign {i + 1}</p>
                <p className="text-sm text-muted-foreground">Created: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{20 + i * 5} Properties</span>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full">
          <Map className="mr-2 h-4 w-4" />
          Create New List
        </Button>
      </CardContent>
    </Card>
  );
};
