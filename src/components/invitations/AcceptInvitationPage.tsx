import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Users, Building, DollarSign, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { ValidateInvitationResponse, AcceptInvitationRequest } from '@/types/unified-invitations';

const acceptInvitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AcceptFormData = z.infer<typeof acceptInvitationSchema>;

export const AcceptInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [invitationData, setInvitationData] = useState<ValidateInvitationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AcceptFormData>({
    resolver: zodResolver(acceptInvitationSchema),
  });

  // Check if user is already logged in
  useEffect(() => {
    if (user && invitationData?.valid) {
      // User is logged in, they can accept directly
      acceptWithExistingAccount();
    }
  }, [user, invitationData]);

  // Validate invitation on mount
  useEffect(() => {
    if (token) {
      validateInvitation();
    } else {
      setError('No invitation token provided');
      setLoading(false);
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('validate-user-invitation', {
        body: { token }
      });

      if (error) throw error;

      if (data.valid && data.invitation) {
        setInvitationData(data);
        // Pre-populate form with invitation data
        setValue('email', data.invitation.email);
        setValue('firstName', data.invitation.firstName || '');
        setValue('lastName', data.invitation.lastName || '');
        setValue('phone', data.invitation.phone || '');
      } else {
        setError(data.error || 'Invalid invitation');
      }
    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const acceptWithExistingAccount = async () => {
    if (!user || !invitationData?.valid) return;

    try {
      setAccepting(true);
      
      // Get current session for X-Supabase-Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('accept-user-invitation', {
        body: {
          token,
          email: user.email,
          // No password required for existing users
        },
        headers: session?.access_token ? {
          'X-Supabase-Authorization': session.access_token
        } : {}
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to accept invitation');

      toast.success('Invitation accepted successfully!');
      
      // Navigate to appropriate dashboard
      const dashboardRoute = getDashboardRoute(data.userType);
      setTimeout(() => navigate(dashboardRoute, { replace: true }), 1000);

    } catch (err) {
      console.error('Error accepting invitation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
      toast.error(errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  const handleSignIn = async () => {
    if (!invitationData?.invitation?.email) return;

    const password = prompt('Please enter your password:');
    if (!password) return;

    try {
      const { error } = await signIn(invitationData.invitation.email, password);
      if (error) {
        toast.error('Sign in failed: ' + error.message);
      } else {
        toast.success('Signed in successfully!');
      }
    } catch (err) {
      toast.error('Sign in failed');
    }
  };

  const handleFormSubmit = async (data: AcceptFormData) => {
    if (!token || !invitationData?.valid) return;

    try {
      setAccepting(true);

      const acceptRequest: AcceptInvitationRequest = {
        token,
        email: data.email,
        password: data.password,
        userData: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        }
      };

      const { data: result, error } = await supabase.functions.invoke('accept-user-invitation', {
        body: acceptRequest
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Failed to accept invitation');

      toast.success('Welcome! Your account has been created successfully.');
      
      // Navigate to appropriate dashboard
      const dashboardRoute = getDashboardRoute(result.userType);
      setTimeout(() => navigate(dashboardRoute, { replace: true }), 2000);

    } catch (err) {
      console.error('Error accepting invitation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
      
      if (errorMessage.includes('account with this email already exists') || errorMessage.includes('shouldSignIn')) {
        setShowSignIn(true);
        toast.error('An account with this email already exists. Please sign in instead.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setAccepting(false);
    }
  };

  const getDashboardRoute = (userType: string): string => {
    switch (userType) {
      case 'mortgage_professional':
        return '/dashboard/mortgage';
      case 'realtor':
        return '/dashboard/realtor';
      case 'client':
        return '/dashboard/client';
      default:
        return '/dashboard';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'client':
        return <Users className="h-12 w-12 text-primary mx-auto mb-4" />;
      case 'realtor':
        return <Building className="h-12 w-12 text-primary mx-auto mb-4" />;
      case 'mortgage_professional':
        return <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />;
      default:
        return <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Validating invitation...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationData?.valid || !invitationData.invitation) {
    return null;
  }

  const invitation = invitationData.invitation;

  // If user is logged in, show acceptance confirmation
  if (user && !accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {getUserTypeIcon(invitation.userType)}
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              You've been invited by {invitation.invitedBy} to join as a <strong>{invitation.userType}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitation.customMessage && (
              <Alert>
                <AlertDescription>
                  <strong>Message:</strong> {invitation.customMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                You're signed in as {user.email}
              </p>
              <Button 
                onClick={acceptWithExistingAccount}
                disabled={accepting}
                className="w-full"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Accepting...
                  </>
                ) : (
                  'Accept Invitation'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show sign-in option if user already exists
  if (showSignIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Account Already Exists</CardTitle>
            <CardDescription>
              An account with {invitation.email} already exists. Please sign in to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSignIn} className="w-full">
              Sign In to Accept Invitation
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowSignIn(false)} 
              className="w-full"
            >
              Back to Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show registration form for new users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          {getUserTypeIcon(invitation.userType)}
          <CardTitle>Complete Your Registration</CardTitle>
          <CardDescription>
            You've been invited by {invitation.invitedBy} to join as a <strong>{invitation.userType}</strong>
          </CardDescription>
          {invitation.customMessage && (
            <Alert className="mt-4">
              <AlertDescription>
                <strong>Message:</strong> {invitation.customMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
                readOnly
                className="bg-muted"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="Enter phone number (optional)"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Create a password (min 8 characters)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || accepting}
              className="w-full"
            >
              {(isSubmitting || accepting) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};