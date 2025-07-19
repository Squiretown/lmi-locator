
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Users, Trash2, Edit, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ScheduledMessage {
  id: string;
  title: string;
  message: string;
  scheduled_for: string;
  delivery_method: string;
  recipient_type: 'single' | 'bulk';
  recipient_id?: string;
  recipient_filter?: any;
  status: 'scheduled' | 'sent' | 'cancelled' | 'failed';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

export function ScheduledMessages() {
  const queryClient = useQueryClient();

  const { data: scheduledMessages = [], isLoading } = useQuery({
    queryKey: ['scheduled-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data as ScheduledMessage[];
    },
  });

  const cancelMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('scheduled_messages')
        .update({ status: 'cancelled' })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Message cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['scheduled-messages'] });
    },
    onError: (error: any) => {
      console.error('Error cancelling message:', error);
      toast.error('Failed to cancel message');
    },
  });

  const sendNowMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.functions.invoke('process-scheduled-message', {
        body: { messageId }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Message sent successfully');
      queryClient.invalidateQueries({ queryKey: ['scheduled-messages'] });
    },
    onError: (error: any) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    },
  });

  const handleCancel = (messageId: string) => {
    if (window.confirm('Are you sure you want to cancel this scheduled message?')) {
      cancelMessageMutation.mutate(messageId);
    }
  };

  const handleSendNow = (messageId: string) => {
    if (window.confirm('Are you sure you want to send this message now?')) {
      sendNowMutation.mutate(messageId);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'default',
      sent: 'secondary',
      cancelled: 'destructive',
      failed: 'destructive'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>;
  };

  const getDeliveryMethodBadge = (method: string) => {
    const methods = method.split(',').map(m => m.trim());
    return (
      <div className="flex gap-1">
        {methods.map((m, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {m === 'in_app' ? 'In-App' : m === 'email' ? 'Email' : m}
          </Badge>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading scheduled messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Messages
        </CardTitle>
        <CardDescription>
          Manage messages scheduled for future delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled messages</p>
            </div>
          ) : (
            scheduledMessages.map((message) => (
              <div key={message.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{message.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(message.status)}
                    {message.recipient_type === 'single' ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Single
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Bulk
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(message.scheduled_for), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(message.scheduled_for), 'h:mm a')}
                    </span>
                  </div>
                  <div>
                    {getDeliveryMethodBadge(message.delivery_method)}
                  </div>
                </div>

                {message.error_message && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    Error: {message.error_message}
                  </div>
                )}

                {message.status === 'scheduled' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendNow(message.id)}
                      disabled={sendNowMutation.isPending}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Send Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancel(message.id)}
                      disabled={cancelMessageMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                {message.sent_at && (
                  <div className="text-xs text-muted-foreground">
                    Sent: {format(new Date(message.sent_at), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
