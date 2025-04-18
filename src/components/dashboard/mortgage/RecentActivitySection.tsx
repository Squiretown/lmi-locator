import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const RecentActivitySection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <ActivityItem
              address="13 DOOLITTLE AVE Y, BRENTWOOD, NY 11717"
              status="eligible"
              description="This property is in an LMI eligible area"
            />
            <ActivityItem
              address="23 OAKLAND DRIVE W., RIVERHEAD, NY 11901"
              status="eligible"
              description="This property is in an LMI eligible area"
            />
            <ActivityItem
              address="99 SQUIRETOWN RD, HAMPTON BAYS, NY 11946"
              status="not-eligible"
              description="This property is not in an LMI eligible area"
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  address: string;
  status: 'eligible' | 'not-eligible';
  description: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ address, status, description }) => (
  <div className="border-b pb-4">
    <p className="font-medium">{address}</p>
    <div className="flex items-center gap-2 mt-1">
      <Badge variant={status === 'eligible' ? 'success' : 'destructive'}>
        {status === 'eligible' ? 'Eligible' : 'Not Eligible'}
      </Badge>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);
