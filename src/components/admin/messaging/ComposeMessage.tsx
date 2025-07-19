
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, MessageSquare } from 'lucide-react';

const composeMessageSchema = z.object({
  recipient_id: z.string().min(1, 'Please select a recipient'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  notification_type: z.string().min(1, 'Notification type is required'),
  send_in_app: z.boolean().default(true),
  send_email: z.boolean().default(false),
});

type ComposeMessageForm = z.infer<typeof composeMessageSchema>;

export function ComposeMessage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ComposeMessageForm>({
    resolver: zodResolver(composeMessageSchema),
    defaultValues: {
      priority: 'normal',
      send_in_app: true,
      send_email: false,
    },
  });

  const onSubmit = async (data: ComposeMessageForm) => {
    setIsLoading(true);
    try {
      let emailSent = false;
      let notificationCreated = false;

      // Send in-app notification if selected
      if (data.send_in_app) {
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
        notificationCreated = true;
      }

      // Send email if selected
      if (data.send_email) {
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-user-email', {
          body: {
            userId: data.recipient_id,
            subject: data.title,
            message: data.message,
          }
        });

        if (emailError) {
          console.error('Email sending failed:', emailError);
          toast.error('Failed to send email, but in-app notification was created');
        } else {
          emailSent = true;
        }
      }

      // Provide appropriate success message
      if (data.send_in_app && data.send_email) {
        if (emailSent) {
          toast.success('Message sent successfully via both in-app notification and email');
        } else {
          toast.success('In-app notification sent successfully, but email failed');
        }
      } else if (data.send_email && emailSent) {
        toast.success('Email sent successfully');
      } else if (data.send_in_app && notificationCreated) {
        toast.success('In-app notification sent successfully');
      }

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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Delivery Method</CardTitle>
            <CardDescription className="text-xs">
              Choose how to deliver this message to the recipient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="send_in_app"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2 font-normal">
                      <MessageSquare className="h-4 w-4" />
                      In-App Notification
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Send as an in-app notification that appears in the user's dashboard
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="send_email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2 font-normal">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Send as an email to the user's registered email address
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
                    <SelectItem value="admin_message">Admin Message</SelectItem>
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
              <FormLabel>Message Title / Subject</FormLabel>
              <FormControl>
                <Input placeholder="Enter message title or email subject" {...field} />
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
