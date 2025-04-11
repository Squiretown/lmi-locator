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
import FormErrorDisplay from '@/pages/auth/components/form-sections/FormErrorDisplay';
import { updateUserEmail } from '@/lib/auth/operations/email-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const emailSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
  currentPassword: z.string()
    .min(1, { message: "Current password is required to verify this change" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const EmailUpdateSection: React.FC = () => {
  const { user } = useAuth();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState<EmailFormValues | null>(null);
  
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || '',
      currentPassword: '',
    }
  });

  const handleFormSubmit = (data: EmailFormValues) => {
    // First check if email is the same as current
    if (data.email === user?.email) {
      toast.info('The email address is the same as your current one');
      return;
    }
    
    // Store the data and open confirmation dialog
    setPendingEmailData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingEmailData) return;
    
    // Reset any previous errors
    setFormError(null);
    setIsEmailLoading(true);
    
    try {
      // First verify the current password is correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: pendingEmailData.currentPassword,
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // Then update the email
      const { success, error } = await updateUserEmail(pendingEmailData.email);
      
      if (!success && error) throw error;
      
      // Keep the new email in the form but clear the password
      emailForm.setValue('currentPassword', '');
    } catch (error: any) {
      console.error('Error updating email:', error);
      setFormError(error.message);
      toast.error(`Failed to update email: ${error.message}`);
    } finally {
      setIsEmailLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
    setPendingEmailData(null);
  };

  return (
    <div>
      <h3 className="text-lg font-medium">Email Address</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Update your email address. You will need to verify your new email.
      </p>
      
      {formError && (
        <div className="mb-4">
          <FormErrorDisplay error={formError} title="Email Update Error" />
        </div>
      )}
      
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(handleFormSubmit)} className="space-y-4">
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your email from <strong>{user?.email}</strong> to <strong>{pendingEmailData?.email}</strong>?
              <br /><br />
              You will need to verify your new email address after this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUpdate}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate}>Yes, Update Email</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmailUpdateSection;
