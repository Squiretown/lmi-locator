
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Mail, MessageSquare, Users, Clock } from 'lucide-react';

interface MessageRecord {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  bulk_message_id?: string;
  is_read: boolean;
  created_at: string;
  delivery_method?: string;
}

export function MessageHistory() {
  const { data: recentMessages, isLoading } = useQuery({
    queryKey: ['admin-message-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as MessageRecord[];
    }
  });

  const { data: bulkMessageStats } = useQuery({
    queryKey: ['bulk-message-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('bulk_message_id, created_at')
        .not('bulk_message_id', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by bulk_message_id
      const grouped = data.reduce((acc: any, record) => {
        const bulkId = record.bulk_message_id;
        if (!acc[bulkId]) {
          acc[bulkId] = {
            bulk_message_id: bulkId,
            count: 0,
            created_at: record.created_at
          };
        }
        acc[bulkId].count++;
        return acc;
      }, {});
      
      return Object.values(grouped);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin_message': return <Mail className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div>Loading message history...</div>;
  }

  // Separate bulk messages from individual messages
  const individualMessages = recentMessages?.filter(msg => !msg.bulk_message_id) || [];
  const bulkMessages = bulkMessageStats || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMessages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Last 50 messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulk Campaigns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bulkMessages.length}</div>
            <p className="text-xs text-muted-foreground">Recent bulk sends</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentMessages?.length ? 
                Math.round((recentMessages.filter(m => m.is_read).length / recentMessages.length) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Message open rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentMessages?.filter(m => 
                new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Messages sent</p>
          </CardContent>
        </Card>
      </div>

      {bulkMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Bulk Messages
            </CardTitle>
            <CardDescription>
              Recent bulk message campaigns and their reach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bulkMessages.slice(0, 5).map((bulk: any) => (
                <div key={bulk.bulk_message_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Bulk Campaign</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {bulk.bulk_message_id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{bulk.count} recipients</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(bulk.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Individual Messages
          </CardTitle>
          <CardDescription>
            Recent individual messages sent to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {individualMessages.map((message) => (
              <div key={message.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(message.notification_type)}
                    <h4 className="font-medium">{message.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(message.priority)}>
                      {message.priority}
                    </Badge>
                    <Badge variant={message.is_read ? 'default' : 'secondary'}>
                      {message.is_read ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {message.message}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Type: {message.notification_type}</span>
                  <span>{format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>
            ))}
          </div>

          {individualMessages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No individual messages sent yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
