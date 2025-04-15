
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircleIcon, XCircleIcon, ClockIcon, CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityItem {
  id: string;
  type: 'search' | 'save' | 'program' | 'specialist';
  timestamp: string;
  address?: string;
  result?: 'eligible' | 'not-eligible';
  details?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ClockIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No recent activity yet</p>
            <p className="text-sm mt-2">Your property searches and saved homes will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Deduplicate activities with the same address and type within a 1-minute window
  const deduplicatedActivities = activities.reduce((acc: ActivityItem[], curr) => {
    const isDuplicate = acc.some(item => 
      item.type === curr.type && 
      item.address === curr.address &&
      Math.abs(new Date(item.timestamp).getTime() - new Date(curr.timestamp).getTime()) < 60000
    );
    
    if (!isDuplicate) {
      acc.push(curr);
    }
    return acc;
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <div className="space-y-4 pr-4">
            {deduplicatedActivities.map((activity) => (
              <div key={activity.id} className="border-b pb-3 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {activity.type === 'search' && 'Property Search'}
                      {activity.type === 'save' && 'Saved Property'}
                      {activity.type === 'program' && 'Program Match'}
                      {activity.type === 'specialist' && 'Specialist Connection'}
                      
                      {activity.result && (
                        <Badge variant={activity.result === 'eligible' ? 'secondary' : 'outline'} className={activity.result === 'eligible' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}>
                          {activity.result === 'eligible' ? (
                            <span className="flex items-center gap-1">
                              <CheckCircleIcon className="h-3 w-3" /> Eligible
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircleIcon className="h-3 w-3" /> Not Eligible
                            </span>
                          )}
                        </Badge>
                      )}
                    </div>
                    
                    {activity.address && (
                      <p className="text-sm mt-1">{activity.address}</p>
                    )}
                    
                    {activity.details && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

