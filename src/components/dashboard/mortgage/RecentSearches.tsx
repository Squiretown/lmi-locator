
import React from 'react';
import { useClientActivity } from '@/hooks/useClientActivity';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const RecentSearches: React.FC = () => {
  const { activities, isLoading } = useClientActivity();
  const navigate = useNavigate();
  
  // Filter out only search activities and sort by timestamp (newest first)
  const searchActivities = activities
    .filter(activity => activity.type === 'search')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4); // Only show the 4 most recent searches

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent LMI Property Searches</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : searchActivities.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No recent property searches found
          </div>
        ) : (
          <div className="space-y-4">
            {searchActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{activity.address || 'Unknown address'}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.timestamp ? format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a') : 'Unknown time'} - {' '}
                    {activity.result === 'eligible' ? 'Eligible' : 'Not Eligible'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${activity.result === 'eligible' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">{activity.result === 'eligible' ? 'LMI Eligible' : 'Not Eligible'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 w-full" 
          onClick={() => navigate('/')}
        >
          <Search className="mr-2 h-4 w-4" />
          Search More Properties
        </Button>
      </CardContent>
    </Card>
  );
};
