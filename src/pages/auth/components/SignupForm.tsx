
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { signupFormSchema, SignupFormValues } from './types/auth-form-types';
import FormErrorDisplay from './form-sections/FormErrorDisplay';
import PersonalInfoFields from './form-sections/PersonalInfoFields';
import EmailField from './form-sections/EmailField';
import PasswordField from './form-sections/PasswordField';
import UserRoleField from './form-sections/UserRoleField';

const SignupForm: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const { signUp, isLoading } = useAuth();

  // Initialize form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      userRole: 'client'
    }
  });

  const handleSignup = async (values: SignupFormValues) => {
    setAuthError(null);
    
    try {
      console.log('Starting signup process for:', values.email);
      
      const metadata = {
        first_name: values.firstName,
        last_name: values.lastName,
        user_type: values.userRole
      };
      
      console.log('Sending metadata:', metadata);
      
      const { error, data } = await signUp(values.email, values.password, metadata);

      console.log('Signup response:', { error, data });

      if (error) {
        console.error('Signup error:', error);
        
        if (error.message?.includes("already registered")) {
          setAuthError('An account with this email already exists. Please log in instead.');
        } else if (error.message?.includes("weak password")) {
          setAuthError('Please use a stronger password with a mix of uppercase, lowercase, numbers, and special characters.');
        } else if (error.message?.includes("permission denied")) {
          console.error('Permission denied details:', error);
          setAuthError('There was a database permission issue. Our team has been notified. Please try again later.');
        } else {
          setAuthError(error.message || 'Failed to create account');
        }
      } else if (data?.user) {
        toast.success('Account created successfully!');
        
        // Check if email confirmation is required
        const requiresEmailConfirmation = !data.session;
        
        if (requiresEmailConfirmation) {
          toast.info('Please check your email to confirm your account before logging in.');
        }
        
        // Reset form after successful signup
        form.reset();
      }
    } catch (err) {
      console.error('Exception during signup:', err);
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignup)}>
        <CardContent className="space-y-4 pt-4">
          <FormErrorDisplay error={authError} />
          <PersonalInfoFields form={form} />
          <EmailField form={form} />
          <PasswordField form={form} />
          <UserRoleField form={form} />
        </CardContent>
        
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default SignupForm;
