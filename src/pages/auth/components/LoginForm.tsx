
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const { signIn, isLoading } = useAuth();

  const clearErrors = () => {
    setAuthError(null);
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

  return (
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
  );
};

export default LoginForm;
