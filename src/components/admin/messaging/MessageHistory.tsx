import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface MessageHistoryItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
  delivered_at: string | null;
}

export function MessageHistory() {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['message-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          notification_type,
          priority,
          created_at,
          is_read,
          user_id,
          delivered_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as MessageHistoryItem[];
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'normal': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'billing':
      case 'payment_due':
        return '💳';
      case 'account_status':
        return '👤';
      case 'system_maintenance':
        return '🔧';
      default:
        return '🔔';
    }
  };

  if (isLoading) {
    return <div>Loading message history...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Message History</h3>
        <p className="text-sm text-muted-foreground">
          Recent messages sent to users
        </p>
      </div>

      <div className="space-y-3">
        {messages?.map((message) => (
          <Card key={message.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getNotificationIcon(message.notification_type)}
                    </span>
                    <h4 className="font-medium">{message.title}</h4>
                    <Badge variant={getPriorityColor(message.priority)}>
                      {message.priority}
                    </Badge>
                    <Badge variant="outline">
                      {message.notification_type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {message.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Sent {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    <span>•</span>
                    <span>User ID: {message.user_id.slice(0, 8)}...</span>
                    <span>•</span>
                    <Badge variant={message.is_read ? 'outline' : 'secondary'} className="text-xs">
                      {message.is_read ? 'Read' : 'Unread'}
                    </Badge>
                    {message.delivered_at && (
                      <>
                        <span>•</span>
                        <span>
                          Delivered {formatDistanceToNow(new Date(message.delivered_at), { addSuffix: true })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No messages sent yet</p>
        </div>
      )}
    </div>
  );
}