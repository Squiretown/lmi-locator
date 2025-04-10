import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  currentPassword: z.string().min(1, { message: "Current password is required." }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const EmailUpdateSection: React.FC = () => {
  const { user } = useAuth();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || '',
      currentPassword: '',
    }
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    if (data.email === user?.email) {
      toast.info('The email address is the same as your current one');
      return;
    }
    
    setIsEmailLoading(true);
    
    try {
      // First verify the current password is correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword,
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // Log the email we're trying to update to
      console.log('Updating email from', user?.email, 'to', data.email);
      
      // Then update the email
      const { data: updateData, error } = await supabase.auth.updateUser({
        email: data.email,
      });
      
      if (error) throw error;
      
      console.log('Email update response:', updateData);
      
      toast.success('Email update initiated. Please check your inbox for confirmation.');
      // Keep the new email in the form but clear the password
      emailForm.setValue('currentPassword', '');
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast.error(`Failed to update email: ${error.message}`);
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium">Email Address</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Update your email address. You will need to verify your new email.
      </p>
      
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Email Address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={emailForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Enter your current password to confirm this change
                </p>
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isEmailLoading}>
            {isEmailLoading ? 'Updating...' : 'Update Email'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EmailUpdateSection;
