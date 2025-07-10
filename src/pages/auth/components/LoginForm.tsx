
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Chrome, Github, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FormErrorDisplay from './form-sections/FormErrorDisplay';
import { verifyAdminAccess } from '@/lib/auth/operations/session';
import { OAuthProvider } from '@/types/auth';

// Define the form schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type FormValues = z.infer<typeof formSchema>;

const oauthProviders: OAuthProvider[] = [
  {
    name: 'Google',
    provider: 'google',
    icon: 'Chrome',
    color: 'hover:bg-red-50 border-red-200 text-red-700'
  },
  {
    name: 'GitHub',
    provider: 'github', 
    icon: 'Github',
    color: 'hover:bg-gray-50 border-gray-200 text-gray-700'
  },
  {
    name: 'Microsoft',
    provider: 'azure',
    icon: 'Zap',
    color: 'hover:bg-blue-50 border-blue-200 text-blue-700'
  }
];

const LoginForm: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminAttempt, setIsAdminAttempt] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const { signIn, isLoading, userType, signInWithOAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on user type after successful login
    if (userType) {
      console.log('User type detected after login:', userType);
      
      // Use a short delay to allow toast notifications to be seen
      setTimeout(() => {
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
      }, 500);
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
    setIsAdminAttempt(values.email.toLowerCase().includes('admin'));
    
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
        return;
      }
      
      // If it's an admin login attempt, verify admin access
      if (isAdminAttempt) {
        const { isAdmin, error: adminError } = await verifyAdminAccess();
        
        if (adminError || !isAdmin) {
          console.error('Admin verification failed:', adminError);
          setAuthError('Admin access verification failed. You may not have admin privileges.');
          // Sign out as this user doesn't have admin access
          await signIn(values.email, values.password);
          return;
        }
        
        // Admin verified, redirect will be handled by the useEffect above
        console.log('Admin access verified successfully');
      }
      
      // Non-admin redirects will be handled by the useEffect above
    } catch (err) {
      console.error('Exception during login:', err);
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'azure' | 'discord') => {
    setAuthError(null);
    setOauthLoading(provider);
    
    try {
      const result = await signInWithOAuth(provider);
      
      if (!result.success) {
        setAuthError(result.error?.message || `Failed to sign in with ${provider}`);
      }
      // Note: OAuth will redirect, so we don't need to handle success here
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error);
      setAuthError(`An error occurred during ${provider} authentication`);
    } finally {
      setOauthLoading(null);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getOAuthIcon = (iconName: string) => {
    switch (iconName) {
      case 'Chrome':
        return Chrome;
      case 'Github':
        return Github;
      case 'Zap':
        return Zap;
      default:
        return Chrome;
    }
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
            disabled={isLoading || oauthLoading !== null}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* OAuth Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* OAuth Providers */}
          <div className="grid grid-cols-1 gap-3">
            {oauthProviders.map((provider) => {
              const IconComponent = getOAuthIcon(provider.icon);
              const isProviderLoading = oauthLoading === provider.provider;
              
              return (
                <Button
                  key={provider.provider}
                  type="button"
                  variant="outline"
                  className={`w-full ${provider.color} transition-colors`}
                  disabled={isLoading || oauthLoading !== null}
                  onClick={() => handleOAuthSignIn(provider.provider)}
                >
                  {isProviderLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <IconComponent className="w-4 h-4 mr-2" />
                  )}
                  {isProviderLoading ? 'Connecting...' : `Continue with ${provider.name}`}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </form>
    </Form>
  );
};

export default LoginForm;
