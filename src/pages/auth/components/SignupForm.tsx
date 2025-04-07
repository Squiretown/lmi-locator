
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import PasswordValidation from './PasswordValidation';

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userRole, setUserRole] = useState('client');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { signUp, isLoading } = useAuth();

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
          <PasswordValidation passwordError={passwordError} />
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
  );
};

export default SignupForm;
