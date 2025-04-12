
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const ActiveApplications: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">Alice Johnson</p>
                <p className="text-sm text-muted-foreground">456 Oak St, Somewhere, CA</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="text-sm">Processing</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
