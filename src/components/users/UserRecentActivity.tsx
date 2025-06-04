
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, UserCheck, User } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'signup' | 'login' | 'update';
  message: string;
  timestamp: string;
  user: string;
}

interface UserRecentActivityProps {
  activities?: ActivityItem[];
}

export const UserRecentActivity: React.FC<UserRecentActivityProps> = ({ activities = [] }) => {
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'signup',
      message: 'New user registered',
      timestamp: '2 minutes ago',
      user: 'jane.smith@example.com',
    },
    {
      id: '2',
      type: 'login',
      message: 'User login',
      timestamp: '5 minutes ago',
      user: 'john.doe@example.com',
    },
    {
      id: '3',
      type: 'update',
      message: 'Profile updated',
      timestamp: '12 minutes ago',
      user: 'sarah.miller@example.com',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <UserPlus className="h-4 w-4" />;
      case 'login':
        return <UserCheck className="h-4 w-4" />;
      case 'update':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'signup':
        return 'bg-green-100 text-green-600';
      case 'login':
        return 'bg-blue-100 text-blue-600';
      case 'update':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-b-0">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">
                <strong>{activity.message}:</strong> {activity.user}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {activity.timestamp}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
