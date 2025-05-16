
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FormErrorDisplay from './form-sections/FormErrorDisplay';

// Define the form schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on user type after successful login
    if (userType) {
      console.log('User type detected after login:', userType);
      
      switch (userType) {
        case 'admin':
          navigate('/admin');
          break;
        case 'mortgage_professional':
          navigate('/dashboard/mortgage');
          break;
        case 'realtor':
          navigate('/dashboard/realtor');
          break;
        case 'client':
          navigate('/dashboard/client');
          break;
        default:
          navigate('/');
      }
    }
  }, [userType, navigate]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleLogin = async (values: FormValues) => {
    setAuthError(null);
    
    try {
      console.log('Attempting login with:', values.email);
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        console.error('Login error:', error);
        
        if (error.message?.includes("Invalid login credentials")) {
          setAuthError('Invalid email or password. Please try again.');
        } else if (error.message?.includes("Email not confirmed")) {
          setAuthError('Please confirm your email address before logging in.');
        } else {
          setAuthError(error.message || 'Failed to login. Please try again.');
        }
      }
      // Redirection will be handled by the useEffect hook above
    } catch (err) {
      console.error('Exception during login:', err);
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)}>
        <CardContent className="space-y-6 pt-4">
          <FormErrorDisplay error={authError} />
          
          <div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center block">Email</FormLabel>
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
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center block">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </CardContent>
      </form>
    </Form>
  );
};

export default LoginForm;
