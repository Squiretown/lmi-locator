import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

const bulkMessageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  notification_type: z.string().min(1, 'Notification type is required'),
  user_filter: z.enum(['all', 'by_type']),
  user_type: z.string().optional(),
});

type BulkMessageForm = z.infer<typeof bulkMessageSchema>;

export function BulkMessaging() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BulkMessageForm>({
    resolver: zodResolver(bulkMessageSchema),
    defaultValues: {
      priority: 'normal',
      user_filter: 'all',
    },
  });

  const userFilter = form.watch('user_filter');

  const onSubmit = async (data: BulkMessageForm) => {
    setIsLoading(true);
    try {
      let targetUsers: string[] = [];

      if (data.user_filter === 'all') {
        // Get all users
        const { data: allUsers, error } = await supabase
          .from('user_profiles')
          .select('user_id');
        
        if (error) throw error;
        targetUsers = allUsers?.map(u => u.user_id) || [];
      } else if (data.user_filter === 'by_type' && data.user_type) {
        // Get users by type
        const { data: typedUsers, error } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_type', data.user_type);
        
        if (error) throw error;
        targetUsers = typedUsers?.map(u => u.user_id) || [];
      }

      if (targetUsers.length === 0) {
        toast.error('No users found matching criteria');
        return;
      }

      // Generate bulk message ID
      const bulkMessageId = crypto.randomUUID();

      // Insert notifications for all target users
      const notifications = targetUsers.map(userId => ({
        user_id: userId,
        title: data.title,
        message: data.message,
        notification_type: data.notification_type,
        priority: data.priority,
        bulk_message_id: bulkMessageId,
        is_read: false,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast.success(`Message sent to ${targetUsers.length} users`);
      form.reset();
    } catch (error: any) {
      console.error('Error sending bulk message:', error);
      toast.error('Failed to send bulk message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Message Configuration
          </CardTitle>
          <CardDescription>
            Send a message to multiple users at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="user_filter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="by_type">Users by Type</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {userFilter === 'by_type' && (
                <FormField
                  control={form.control}
                  name="user_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="client">Clients</SelectItem>
                          <SelectItem value="realtor">Realtors</SelectItem>
                          <SelectItem value="mortgage_professional">Mortgage Professionals</SelectItem>
                          <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notification_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="payment_due">Payment Due</SelectItem>
                          <SelectItem value="account_status">Account Status</SelectItem>
                          <SelectItem value="system_maintenance">System Maintenance</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter message title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your message here..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Sending...' : 'Send Bulk Message'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}