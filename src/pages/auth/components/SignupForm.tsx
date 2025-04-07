
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import PasswordRequirements from './PasswordRequirements';

// Password regex validation
const passwordRegex = {
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[^A-Za-z0-9]/
};

// Define the form schema with advanced password validation
const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .refine(val => passwordRegex.hasUppercase.test(val), {
      message: 'Password must include at least one uppercase letter'
    })
    .refine(val => passwordRegex.hasLowercase.test(val), {
      message: 'Password must include at least one lowercase letter'
    })
    .refine(val => passwordRegex.hasNumber.test(val), {
      message: 'Password must include at least one number'
    })
    .refine(val => passwordRegex.hasSpecialChar.test(val), {
      message: 'Password must include at least one special character'
    }),
  userRole: z.enum(['client', 'realtor', 'mortgage_professional'])
});

type FormValues = z.infer<typeof formSchema>;

const SignupForm: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isLoading } = useAuth();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      userRole: 'client'
    }
  });

  const passwordValue = form.watch('password');

  const handleSignup = async (values: FormValues) => {
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignup)}>
        <CardContent className="space-y-4 pt-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <PasswordRequirements password={passwordValue} />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="userRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                  >
                    <option value="client">Home Buyer / Client</option>
                    <option value="realtor">Real Estate Agent</option>
                    <option value="mortgage_professional">Mortgage Professional</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
