import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InvitationData {
  id: string;
  client_name?: string;
  client_email: string;
  professional_id: string;
  invitation_type: string;
  invitation_category: string;
  invitation_target_type: string;
  target_professional_role?: string;
  custom_message?: string;
  expires_at: string;
  status: string;
  team_showcase?: any;
}

const AcceptInvitation: React.FC = () => {
  const { code, token } = useParams<{ code?: string; token?: string }>();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUnifiedSystem, setIsUnifiedSystem] = useState(false);

  useEffect(() => {
    if (token) {
      // New unified system using tokens
      setIsUnifiedSystem(true);
      fetchUnifiedInvitation();
    } else if (code) {
      // Legacy system using codes
      setIsUnifiedSystem(false);
      fetchLegacyInvitation();
    } else {
      setError('No invitation identifier provided');
      setLoading(false);
    }
  }, [code, token]);

  const fetchUnifiedInvitation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('validate-user-invitation', {
        body: { token }
      });

      if (error) throw error;

      if (!data.valid) {
        setError(data.error || 'Invalid invitation');
        return;
      }

      // Transform unified invitation data to match legacy interface
      const unifiedInvitation = {
        id: data.invitation.id,
        client_name: data.invitation.firstName && data.invitation.lastName 
          ? `${data.invitation.firstName} ${data.invitation.lastName}` 
          : data.invitation.firstName,
        client_email: data.invitation.email,
        professional_id: data.invitation.invitedBy,
        invitation_type: 'unified',
        invitation_category: 'unified',
        invitation_target_type: data.invitation.userType,
        target_professional_role: data.invitation.professionalType,
        custom_message: data.invitation.customMessage,
        expires_at: data.invitation.expiresAt,
        status: 'pending',
        team_showcase: null
      };

      setInvitation(unifiedInvitation);
      setEmail(data.invitation.email);

      // If user is not logged in, show auth form
      if (!user) {
        setShowAuth(true);
      }
    } catch (err) {
      console.error('Error fetching unified invitation:', err);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const fetchLegacyInvitation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('invitation_code', code)
        .single();

      if (error) {
        setError('Invitation not found or invalid');
        return;
      }

      if (data.status !== 'pending') {
        setError('This invitation has already been used or expired');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        return;
      }

      setInvitation(data);
      setEmail(data.client_email);

      // If user is not logged in, show auth form
      if (!user) {
        setShowAuth(true);
      }
    } catch (err) {
      console.error('Error fetching legacy invitation:', err);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (authMode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
          return;
        }
      } else {
        // Determine user type based on invitation
        const userType = invitation?.invitation_target_type === 'professional' 
          ? invitation.target_professional_role || 'realtor'
          : 'client';
          
        const { error } = await signUp(email, password, {
          first_name: invitation?.client_name?.split(' ')[0] || '',
          last_name: invitation?.client_name?.split(' ').slice(1).join(' ') || '',
          user_type: userType,
          invitation_context: true // Flag to allow client signup via invitation
        });
        if (error) {
          toast.error(error.message);
          return;
        }
      }
      setShowAuth(false);
    } catch (err) {
      console.error('Auth error:', err);
      toast.error('Authentication failed');
    }
  };

  const acceptInvitation = async () => {
    if (!invitation || !user) return;

    try {
      setAccepting(true);
      
      if (isUnifiedSystem) {
        // Use new unified system
        const { data, error } = await supabase.functions.invoke('accept-user-invitation', {
          body: {
            token: token!,
            password: null, // User is already authenticated
            userData: {
              firstName: invitation.client_name?.split(' ')[0] || '',
              lastName: invitation.client_name?.split(' ').slice(1).join(' ') || '',
            }
          }
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Failed to accept invitation');

        toast.success('Invitation accepted successfully!');
        
        // Navigate based on user type from unified system
        setTimeout(() => {
          const dashboardRoute = invitation.invitation_target_type === 'mortgage_professional' 
            ? '/dashboard/mortgage'
            : invitation.invitation_target_type === 'realtor' 
            ? '/dashboard/realtor'
            : '/dashboard/client';
            
          console.log('Navigating to:', dashboardRoute, 'for user type:', invitation.invitation_target_type);
          navigate(dashboardRoute, { replace: true });
        }, 2000);

      } else {
        // Use legacy system
        const { data, error } = await supabase.functions.invoke('accept-invitation', {
          body: {
            invitationCode: code,
            userEmail: user.email
          }
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Failed to accept invitation');

        toast.success('Invitation accepted successfully!');
        
        // Navigate to appropriate dashboard based on invitation type
        setTimeout(() => {
          const dashboardRoute = data.userType === 'mortgage_professional' 
            ? '/dashboard/mortgage'
            : data.userType === 'realtor' 
            ? '/dashboard/realtor'
            : '/dashboard/client';
            
          console.log('Navigating to:', dashboardRoute, 'for user type:', data.userType);
          navigate(dashboardRoute, { replace: true });
        }, 2000);
      }

    } catch (err) {
      console.error('Error accepting invitation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
      toast.error(errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading invitation...</span>
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

  if (showAuth && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>
              {invitation.invitation_target_type === 'professional' ? 'Professional' : 'Client'} Invitation
            </CardTitle>
            <CardDescription>
              You've been invited to join as a {invitation.invitation_target_type === 'professional' 
                ? invitation.target_professional_role || 'professional' 
                : invitation.invitation_target_type === 'client' ? 'client' : invitation.invitation_target_type}. Please sign in or create an account to continue.
            </CardDescription>
            {invitation.custom_message && (
              <div className="mt-4 p-3 bg-secondary/30 rounded-md text-sm">
                <strong>Message:</strong> {invitation.custom_message}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                  placeholder={authMode === 'signup' ? 'Create a password' : 'Enter your password'}
                />
              </div>
              <Button type="submit" className="w-full">
                {authMode === 'signin' ? 'Sign In & Accept' : 'Create Account & Accept'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm text-primary hover:underline"
                >
                  {authMode === 'signin' ? 'New user? Create an account' : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>
            {invitation.invitation_target_type === 'professional' ? 'Professional' : 'Client'} Invitation
          </CardTitle>
          <CardDescription>
            You've been invited to join as a {invitation.invitation_target_type === 'professional' 
              ? invitation.target_professional_role || 'professional' 
              : invitation.invitation_target_type === 'client' ? 'client' : invitation.invitation_target_type}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation.client_name && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invited as:</p>
              <p className="font-medium">{invitation.client_name}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email:</p>
            <p className="font-medium">{invitation.client_email}</p>
          </div>

          {invitation.custom_message && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Message:</p>
              <p className="text-sm bg-secondary/50 p-3 rounded-md">{invitation.custom_message}</p>
            </div>
          )}

          {invitation.team_showcase && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Your Team:</p>
              <div className="space-y-2">
                {invitation.team_showcase.map((member: any, index: number) => (
                  <div key={index} className="text-sm bg-secondary/50 p-2 rounded">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-muted-foreground">{member.role} at {member.company}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button 
              onClick={acceptInvitation} 
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
};

export default AcceptInvitation;