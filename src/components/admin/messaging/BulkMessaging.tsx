
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Mail, MessageSquare, AlertTriangle, Clock, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const bulkMessageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  notification_type: z.string().min(1, 'Notification type is required'),
  user_filter: z.enum(['all', 'by_type']),
  user_type: z.string().optional(),
  send_in_app: z.boolean().default(true),
  send_email: z.boolean().default(false),
  schedule_delivery: z.boolean().default(false),
  scheduled_for: z.string().optional(),
});

type BulkMessageForm = z.infer<typeof bulkMessageSchema>;

export function BulkMessaging() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUsers, setPreviewUsers] = useState<string[]>([]);

  const form = useForm<BulkMessageForm>({
    resolver: zodResolver(bulkMessageSchema),
    defaultValues: {
      priority: 'normal',
      user_filter: 'all',
      send_in_app: true,
      send_email: false,
      schedule_delivery: false,
    },
  });

  const userFilter = form.watch('user_filter');
  const sendEmail = form.watch('send_email');
  const sendInApp = form.watch('send_in_app');
  const scheduleDelivery = form.watch('schedule_delivery');

  const previewRecipients = async () => {
    const data = form.getValues();
    try {
      let targetUsers: string[] = [];

      if (data.user_filter === 'all') {
        const { data: allUsers, error } = await supabase
          .from('user_profiles')
          .select('user_id');
        
        if (error) throw error;
        targetUsers = allUsers?.map(u => u.user_id) || [];
      } else if (data.user_filter === 'by_type' && data.user_type) {
        const { data: typedUsers, error } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_type', data.user_type);
        
        if (error) throw error;
        targetUsers = typedUsers?.map(u => u.user_id) || [];
      }

      setPreviewUsers(targetUsers);
    } catch (error: any) {
      console.error('Error previewing recipients:', error);
      toast.error('Failed to preview recipients');
    }
  };

  const onSubmit = async (data: BulkMessageForm) => {
    if (!data.send_in_app && !data.send_email) {
      toast.error('Please select at least one delivery method');
      return;
    }

    if (data.schedule_delivery && !data.scheduled_for) {
      toast.error('Please select a delivery date and time');
      return;
    }

    setIsLoading(true);
    try {
      let targetUsers: string[] = [];

      if (data.user_filter === 'all') {
        const { data: allUsers, error } = await supabase
          .from('user_profiles')
          .select('user_id');
        
        if (error) throw error;
        targetUsers = allUsers?.map(u => u.user_id) || [];
      } else if (data.user_filter === 'by_type' && data.user_type) {
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

      if (data.schedule_delivery && data.scheduled_for) {
        // Save as scheduled bulk message
        const deliveryMethods = [];
        if (data.send_in_app) deliveryMethods.push('in_app');
        if (data.send_email) deliveryMethods.push('email');

        // For now, schedule by creating multiple notifications with scheduled_for
        const notifications = targetUsers.map(userId => ({
          user_id: userId,
          title: data.title,
          message: data.message,
          scheduled_for: data.scheduled_for,
          delivery_method: deliveryMethods.join(','),
          notification_type: data.notification_type,
          priority: data.priority,
          is_read: false,
        }));

        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) throw error;
        toast.success(`Bulk message scheduled for ${targetUsers.length} users`);
      } else {
        // Send immediately
        const bulkMessageId = crypto.randomUUID();
        let notificationsCreated = 0;
        let emailsSent = 0;
        let emailsFailed = 0;

        // Send in-app notifications if selected
        if (data.send_in_app) {
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
          notificationsCreated = targetUsers.length;
        }

        // Send emails if selected
        if (data.send_email) {
          // Process emails in batches to avoid overwhelming the system
          const batchSize = 5;
          for (let i = 0; i < targetUsers.length; i += batchSize) {
            const batch = targetUsers.slice(i, i + batchSize);
            
            const emailPromises = batch.map(async (userId) => {
              try {
                const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-user-email', {
                  body: {
                    userId: userId,
                    subject: data.title,
                    message: data.message,
                  }
                });

                if (emailError) throw emailError;
                return { success: true, userId };
              } catch (error) {
                console.error(`Failed to send email to user ${userId}:`, error);
                return { success: false, userId };
              }
            });

            const results = await Promise.all(emailPromises);
            emailsSent += results.filter(r => r.success).length;
            emailsFailed += results.filter(r => !r.success).length;

            // Add small delay between batches
            if (i + batchSize < targetUsers.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        // Provide detailed success message
        let successMessage = '';
        if (data.send_in_app && data.send_email) {
          successMessage = `Bulk message sent to ${targetUsers.length} users. In-app notifications: ${notificationsCreated}, Emails sent: ${emailsSent}`;
          if (emailsFailed > 0) {
            successMessage += `, Emails failed: ${emailsFailed}`;
          }
        } else if (data.send_email) {
          successMessage = `Emails sent to ${emailsSent} users`;
          if (emailsFailed > 0) {
            successMessage += `, ${emailsFailed} failed`;
          }
        } else {
          successMessage = `In-app notifications sent to ${notificationsCreated} users`;
        }

        toast.success(successMessage);
      }

      form.reset();
      setPreviewUsers([]);
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
            Send a message to multiple users at once via in-app notifications and/or email
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

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={previewRecipients}
                  className="flex-1"
                >
                  Preview Recipients ({previewUsers.length})
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Delivery Options</CardTitle>
                  <CardDescription className="text-xs">
                    Choose how and when to deliver this bulk message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="schedule_delivery"
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
                            <Clock className="h-4 w-4" />
                            Schedule for Later
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Schedule this bulk message to be sent at a specific date and time
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {scheduleDelivery && (
                    <FormField
                      control={form.control}
                      name="scheduled_for"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

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
                            In-App Notifications
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Send as in-app notifications in users' dashboards
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
                            Send emails to users' registered email addresses
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {sendEmail && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        Bulk emails will be sent in batches to prevent overwhelming the email service. 
                        Large batches may take several minutes to complete.
                      </p>
                    </div>
                  )}
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
                    <FormLabel>Message Title / Email Subject</FormLabel>
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

              <Button 
                type="submit" 
                disabled={isLoading || (!sendInApp && !sendEmail)} 
                className="w-full"
              >
                {isLoading ? (
                  'Processing...'
                ) : scheduleDelivery ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule Bulk Message{previewUsers.length > 0 ? ` to ${previewUsers.length} users` : ''}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Bulk Message{previewUsers.length > 0 ? ` to ${previewUsers.length} users` : ''}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
