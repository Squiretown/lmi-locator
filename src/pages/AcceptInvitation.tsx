import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Users, FileText } from 'lucide-react';
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
  const { code } = useParams<{ code: string }>();
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

  useEffect(() => {
    if (code) {
      fetchInvitation();
    }
  }, [code]);

  const fetchInvitation = async () => {
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
      console.error('Error fetching invitation:', err);
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
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: {
          invitationCode: code,
          userEmail: user.email
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to accept invitation');
      }

      toast.success('Invitation accepted successfully!');
      
      // Navigate to appropriate dashboard based on invitation type
      const dashboardRoute = data.userType === 'mortgage_professional' 
        ? '/dashboard/mortgage'
        : data.userType === 'realtor' 
        ? '/dashboard/realtor'
        : '/dashboard/client';
        
      setTimeout(() => {
        navigate(dashboardRoute);
      }, 2000);

    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast.error('Failed to accept invitation');
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
                : 'client'}. Please sign in or create an account to continue.
            </CardDescription>
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
                />
              </div>
              <Button type="submit" className="w-full">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm text-primary hover:underline"
                >
                  {authMode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
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
              : 'client'}
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