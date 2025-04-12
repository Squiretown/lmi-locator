
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export const PendingApplications: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">John Smith</p>
                <p className="text-sm text-muted-foreground">123 Main St, Anytown, CA</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Pending Review</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
