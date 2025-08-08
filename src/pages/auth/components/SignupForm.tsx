
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signupFormSchema, SignupFormValues } from './types/auth-form-types';
import FormErrorDisplay from './form-sections/FormErrorDisplay';

const SignupForm: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const { signUp, isLoading, user, userType } = useAuth();
  const navigate = useNavigate();

  // Initialize form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      userRole: 'realtor',
      licenseNumber: '',
      referralCode: '',
      referredByType: 'none',
      referredByName: ''
    }
  });

  const handleSignup = async (values: SignupFormValues) => {
    setAuthError(null);
    
    try {
      console.log('Starting signup process for:', values.email);
      
      const metadata = {
        first_name: values.firstName,
        last_name: values.lastName,
        user_type: values.userRole,
        license_number: values.licenseNumber,
        ...(values.referralCode && { referral_code: values.referralCode }),
        ...(values.referredByType && values.referredByType !== 'none' && { 
          referred_by_type: values.referredByType,
          referred_by_name: values.referredByName || ''
        })
      };
      
      const { error } = await signUp(values.email, values.password, metadata);

      if (error) {
        console.error('Signup error:', error);
        
        if (error.message?.includes("already registered")) {
          setAuthError('An account with this email already exists. Please log in instead.');
        } else if (error.message?.includes("weak password")) {
          setAuthError('Please use a stronger password with a mix of letters, numbers, and special characters.');
        } else {
          setAuthError(error.message || 'Failed to create account');
        }
      } else {
        // Success! Show success state and prepare for redirect
        setUserEmail(values.email);
        setSignupSuccess(true);
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

  // Auto-redirect after successful signup
  useEffect(() => {
    if (user && userType && signupSuccess) {
      const timer = setTimeout(() => {
        if (userType === 'realtor') {
          navigate('/realtor');
        } else if (userType === 'mortgage_professional') {
          navigate('/mortgage-professional');
        } else {
          navigate('/dashboard');
        }
      }, 3000); // 3 second delay to show success message

      return () => clearTimeout(timer);
    }
  }, [user, userType, signupSuccess, navigate]);

  const watchReferredByType = form.watch('referredByType');

  // Show success state
  if (signupSuccess) {
    return (
      <CardContent className="space-y-6 pt-6 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome! Your Free Trial Starts Now
          </h2>
          <p className="text-muted-foreground mb-4">
            Account created successfully for {userEmail}
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold text-primary">14-Day Free Trial Active</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Access to all premium features</p>
            <p>✓ Unlimited client management</p>
            <p>✓ Team collaboration tools</p>
            <p>✓ Advanced analytics & reporting</p>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>What's Next?</strong>
            <br />
            You'll be redirected to your dashboard in a few seconds. Start exploring all the features available during your free trial!
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          No credit card required • Cancel anytime • Full access to all features
        </p>
      </CardContent>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignup)}>
        <CardContent className="space-y-4 pt-4">
          {/* Trial Benefits Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="font-semibold text-primary">Start Your 14-Day Free Trial</span>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Full access to all premium features • Cancel anytime
            </p>
          </div>

          <FormErrorDisplay error={authError} />
          
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="realtor">Realtor</SelectItem>
                    <SelectItem value="mortgage_professional">Mortgage Professional</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your professional license number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Are you a home buyer or client?</h4>
            <p className="text-sm text-blue-700">
              Clients are invited by real estate professionals and don't sign up directly. 
              Contact your realtor or mortgage professional to receive an invitation to access the platform.
            </p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Referral Information (Optional)</h3>
            
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter referral code if you have one" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referredByType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Were you referred by a professional?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select referral type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No referral</SelectItem>
                      <SelectItem value="mortgage_professional">Mortgage Professional</SelectItem>
                      <SelectItem value="realtor">Realtor</SelectItem>
                      <SelectItem value="professional">Other Professional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchReferredByType && watchReferredByType !== 'none' && (
              <FormField
                control={form.control}
                name="referredByName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the name of who referred you" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 mt-4" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </CardContent>
      </form>
    </Form>
  );
};

export default SignupForm;
