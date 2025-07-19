import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const composeMessageSchema = z.object({
  recipient_id: z.string().min(1, 'Please select a recipient'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  notification_type: z.string().min(1, 'Notification type is required'),
});

type ComposeMessageForm = z.infer<typeof composeMessageSchema>;

export function ComposeMessage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ComposeMessageForm>({
    resolver: zodResolver(composeMessageSchema),
    defaultValues: {
      priority: 'normal',
    },
  });

  const onSubmit = async (data: ComposeMessageForm) => {
    setIsLoading(true);
    try {
      // Insert notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.recipient_id,
          title: data.title,
          message: data.message,
          notification_type: data.notification_type,
          priority: data.priority,
          is_read: false,
        });

      if (error) throw error;

      toast.success('Message sent successfully');
      form.reset();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="recipient_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient User ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter user ID" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                You can find user IDs in the User Management section
              </p>
            </FormItem>
          )}
        />

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
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Form>
  );
}