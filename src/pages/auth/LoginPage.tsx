
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userRole, setUserRole] = useState('client');
  const [authError, setAuthError] = useState<string | null>(null);
  const { signIn, signUp, isLoading } = useAuth();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must include at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must include at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must include at least one number";
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      return "Password must include at least one special character";
    }
    return null;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(newPassword ? validatePassword(newPassword) : null);
  };

  const clearErrors = () => {
    setAuthError(null);
    setPasswordError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    try {
      console.log('Attempting login with:', email);
      const { error } = await signIn(email, password);
      console.log('Login result:', error ? 'Error' : 'Success');
      
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
      // Navigation will be handled by AuthWrapper in App.tsx if successful
    } catch (err) {
      console.error('Exception during login:', err);
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    if (!firstName || !lastName) {
      setAuthError('Please enter your first and last name');
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      console.log('Starting signup process for:', email);
      
      const metadata = {
        first_name: firstName,
        last_name: lastName,
        user_type: userRole
      };
      
      console.log('Sending metadata:', metadata);
      
      const { error, data } = await signUp(email, password, metadata);

      console.log('Signup response:', { error, data });

      if (error) {
        console.error('Signup error:', error);
        
        if (error.message?.includes("already registered")) {
          setAuthError('An account with this email already exists. Please log in instead.');
        } else if (error.message?.includes("weak password")) {
          setPasswordError('Please use a stronger password with a mix of uppercase, lowercase, numbers, and special characters.');
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
        } else {
          // If no email confirmation required, user should be logged in already
          // The AuthWrapper in App.tsx will handle the redirection
        }
        
        // Clear form fields after successful signup
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (err) {
      console.error('Exception during signup:', err);
      setAuthError('An unexpected error occurred. Please try again.');
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
                {authError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
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
                {authError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
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
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordError && (
                    <div className="flex items-center text-sm text-red-500 mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {passwordError}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
                  </p>
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
