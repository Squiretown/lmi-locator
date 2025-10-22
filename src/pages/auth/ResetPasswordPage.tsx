
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updatePasswordWithToken } from '@/lib/auth/operations';
import { supabase } from '@/integrations/supabase/client';
import FormErrorDisplay from './components/form-sections/FormErrorDisplay';
import PasswordRequirements from './components/PasswordRequirements';

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof passwordSchema>;

const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [urlError, setUrlError] = useState<{ type: string; description: string } | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  // Check if user has valid password reset session
  useEffect(() => {
    const checkSession = async () => {
      // Parse URL hash for error parameters
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description');
      const error = params.get('error');
      
      if (errorCode || error) {
        console.log('Password reset URL error:', { errorCode, error, errorDesc });
        
        // Set specific error messages based on error codes
        if (errorCode === 'otp_expired') {
          setUrlError({ 
            type: 'expired', 
            description: 'Your password reset link has expired. Password reset links are only valid for 1 hour and can only be used once.' 
          });
        } else if (error === 'access_denied') {
          setUrlError({ 
            type: 'denied', 
            description: 'Access denied. This password reset link is invalid or has already been used.' 
          });
        } else {
          setUrlError({ 
            type: 'unknown', 
            description: errorDesc ? decodeURIComponent(errorDesc) : 'An error occurred with your password reset link.' 
          });
        }
        return;
      }
      
      // Get session from URL
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !data.session) {
        setFormError("Invalid or expired password reset link. Please request a new reset link.");
        return;
      }
      
      setHasValidSession(true);
    };
    
    checkSession();
  }, []);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    setIsLoading(true);
    
    try {
      const { success, error } = await updatePasswordWithToken(values.password);
      
      if (success) {
        toast.success('Password successfully reset!');
        // Redirect to login page after successful reset
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error) {
        setFormError(error.message);
      }
    } catch (error: any) {
      setFormError(error.message);
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Create a new password for your account
          </p>
        </div>
        
        {(formError || urlError) && (
          <FormErrorDisplay 
            error={urlError?.description || formError || ''} 
            title={urlError ? "Link Invalid or Expired" : "Password Reset Error"} 
          />
        )}
        
        {hasValidSession ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <PasswordRequirements password={field.value} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center space-y-4">
            {urlError ? (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h3 className="font-semibold text-amber-800 mb-2">
                  {urlError.type === 'expired' ? '⏰ Link Expired' : '🔒 Access Denied'}
                </h3>
                <p className="text-amber-700 text-sm mb-4">
                  {urlError.description}
                </p>
              </div>
            ) : (
              <p className="text-red-600">
                Invalid or expired password reset link. Please request a new one.
              </p>
            )}
            <div className="space-x-2">
              <Button 
                variant="default" 
                onClick={() => navigate('/client-login?tab=reset')}
              >
                Request New Reset Link
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/client-login')}
              >
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
