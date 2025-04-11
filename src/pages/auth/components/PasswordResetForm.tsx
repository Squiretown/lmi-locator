
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { resetPassword } from '@/lib/auth/auth-operations';
import FormErrorDisplay from './form-sections/FormErrorDisplay';

const resetSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

const PasswordResetForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (values: ResetFormValues) => {
    setFormError(null);
    setIsLoading(true);
    
    try {
      const { success, error } = await resetPassword(values.email);
      
      if (success) {
        setEmailSent(true);
        form.reset();
      } else if (error) {
        setFormError(error.message);
      }
    } catch (error: any) {
      setFormError(error.message);
      toast.error('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-sm text-muted-foreground mt-2">
          We'll send you an email with instructions to reset your password
        </p>
      </div>
      
      {formError && (
        <FormErrorDisplay error={formError} title="Password Reset Error" />
      )}
      
      {emailSent ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
          <h3 className="font-medium text-green-800">Reset Instructions Sent!</h3>
          <p className="text-green-700 mt-2">
            Check your email for password reset instructions. It may take a few minutes to arrive.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="your@email.com" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PasswordResetForm;
