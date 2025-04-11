
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { resetPassword } from '@/lib/auth/auth-operations';
import FormErrorDisplay from './form-sections/FormErrorDisplay';

// Improved email validation pattern
const resetSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    // Additional RFC-compliant email validation
    .refine(email => {
      // Basic RFC 5322 compliant regex
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }, { message: "Please enter a valid email address format" }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

const PasswordResetForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    }
  });

  // Countdown timer for rate limiting
  useEffect(() => {
    if (retryCountdown <= 0) {
      setRateLimited(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setRetryCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [retryCountdown]);

  const onSubmit = async (values: ResetFormValues) => {
    // Don't submit if rate limited
    if (rateLimited) {
      toast.error(`Please wait ${retryCountdown} seconds before trying again`);
      return;
    }
    
    setFormError(null);
    setIsLoading(true);
    
    try {
      // Check for common typos
      const email = values.email.trim();
      const knownTypos: Record<string, string> = {
        'squrietown.co': 'squiretown.co'
      };
      
      // Correcting common typos
      const domain = email.split('@')[1];
      if (domain && knownTypos[domain]) {
        const correctedEmail = email.replace(domain, knownTypos[domain]);
        toast.info(`Using corrected email: ${correctedEmail}`);
        values.email = correctedEmail;
      }
      
      // Get the current URL for proper redirect
      const origin = window.location.origin;
      const redirectUrl = `${origin}/reset-password`;
      console.log(`Using redirect URL: ${redirectUrl}`);
      
      const { success, error } = await resetPassword(values.email, redirectUrl);
      
      if (success) {
        setEmailSent(true);
        form.reset();
      } else if (error) {
        console.error("Password reset error:", error);
        
        // Handle rate limiting
        if ('isRateLimited' in error && error.isRateLimited) {
          setRateLimited(true);
          if ('retryAfter' in error && typeof error.retryAfter === 'number') {
            setRetryCountdown(error.retryAfter);
          } else {
            setRetryCountdown(60); // Default 60 seconds
          }
        }
        
        setFormError(error.message);
      }
    } catch (error: any) {
      console.error("Exception sending reset email:", error);
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
      
      {rateLimited && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-center">
          <h3 className="font-medium text-amber-800">Rate Limit Reached</h3>
          <p className="text-amber-700 mt-2">
            Please wait {retryCountdown} seconds before requesting another password reset.
          </p>
        </div>
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
            
            <Button type="submit" className="w-full" disabled={isLoading || rateLimited}>
              {isLoading ? 'Sending...' : rateLimited ? `Wait ${retryCountdown}s` : 'Send Reset Instructions'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PasswordResetForm;
