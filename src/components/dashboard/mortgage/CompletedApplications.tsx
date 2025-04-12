
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export const CompletedApplications: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completed Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">Bob Williams</p>
                <p className="text-sm text-muted-foreground">789 Pine St, Elsewhere, CA</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Approved</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
