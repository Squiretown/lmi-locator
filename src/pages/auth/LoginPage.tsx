
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userRole, setUserRole] = useState('client');
  const { signIn, signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Failed to login');
      } else {
        toast.success('Logged in successfully');
        // Navigation will be handled by AuthWrapper in App.tsx
      }
    } catch (err) {
      console.error('Exception during login:', err);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    if (!firstName || !lastName) {
      toast.error('Please enter your first and last name');
      return;
    }

    try {
      console.log('Starting signup process for:', email);
      
      const { error, data } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        user_type: userRole
      });

      console.log('Signup response:', { error, data });

      if (error) {
        console.error('Signup error:', error);
        
        // Check for specific error types
        if (error.message?.includes("already exists")) {
          toast.error('An account with this email already exists. Please log in instead.');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
      } else if (data?.user) {
        toast.success('Account created successfully! Please check your email to confirm your account.');
        
        // Check if email confirmation is required
        const requiresEmailConfirmation = !data.session;
        
        if (requiresEmailConfirmation) {
          toast.info('Please check your email to confirm your account before logging in.');
        } else {
          // User is auto-logged in, navigate appropriately
          // Navigation will be handled by AuthWrapper in App.tsx
        }
        
        // Clear signup form fields
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (err) {
      console.error('Exception during signup:', err);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to LMI Property Checker</CardTitle>
          <CardDescription>
            Sign in to access your account or create a new one
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-role">I am a</Label>
                  <select
                    id="user-role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="client">Home Buyer / Client</option>
                    <option value="realtor">Real Estate Agent</option>
                    <option value="mortgage_professional">Mortgage Professional</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;
