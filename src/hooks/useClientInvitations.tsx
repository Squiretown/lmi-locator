import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UnifiedInvitationPayload, StandardInvitationHeaders } from '@/types/invitations';

export interface ClientInvitation {
  id: string;
  professional_id: string;
  client_email: string;
  client_name?: string;
  client_phone?: string;
  invitation_code: string;
  invitation_type: 'email' | 'sms' | 'both';
  status: 'pending' | 'sent' | 'accepted' | 'expired' | 'revoked';
  email_sent: boolean;
  sms_sent: boolean;
  sent_at?: string;
  accepted_at?: string;
  expires_at: string;
  client_id?: string;
  template_type: string;
  custom_message?: string;
  invitation_target_type?: string;
  target_professional_role?: string;
  team_context?: any;
  team_showcase?: any;
  accepted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationData {
  email: string;
  name?: string;
  phone?: string;
  invitationType: 'email' | 'sms' | 'both';
  templateType?: string;
  customMessage?: string;
}

export function useClientInvitations() {
  const queryClient = useQueryClient();

  // Set up real-time subscription for invitation updates
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

    const channel = supabase
      .channel('client-invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_invitations'
        },
        (payload) => {
          console.log('Invitation change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
          
          // Also invalidate client profiles in case a client was created
          if (payload.eventType === 'UPDATE' && payload.new?.status === 'accepted') {
            queryClient.invalidateQueries({ queryKey: ['realtor-client-profiles'] });
            queryClient.invalidateQueries({ queryKey: ['mortgage-clients'] });
            queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
          }
        }
      )
      .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [queryClient]);

  // Small helper to fail fast on slow/hanging requests
  function withTimeout<T>(promise: Promise<T>, ms = 12000, label = 'Request'): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => {
        reject(new Error(`${label} timed out. Please try again.`));
      }, ms);
      promise
        .then((v) => {
          clearTimeout(id);
          resolve(v);
        })
        .catch((e) => {
          clearTimeout(id);
          reject(e);
        });
    });
  }

  // Fetch client invitations
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['client-invitations'],
    queryFn: async () => {
      try {
        return await withTimeout(
          (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Get the user's professional profile first
            const { data: professional, error: profError } = await supabase
              .from('professionals')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (profError || !professional) {
              throw new Error('Professional profile not found. Please complete your profile setup.');
            }

            const { data, error } = await supabase
              .from('client_invitations')
              .select('*')
              .eq('professional_id', professional.id)
              .eq('invitation_target_type', 'client')
              .order('created_at', { ascending: false });

            if (error) throw error;
            return data as ClientInvitation[];
          })(),
          12000,
          'Loading invitations'
        );
      } catch (error: any) {
        const message = error?.message || 'Unable to load invitations';
        toast.error(`Failed to load invitations: ${message}`);
        throw error;
      }
    },
  });

  // Create invitation mutation with duplicate prevention
  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: CreateInvitationData) => {
      return withTimeout(
        (async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          // Load current professional id for correct scoping
          const { data: professional, error: profErr } = await supabase
            .from('professionals')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (profErr || !professional) {
            throw new Error('Professional profile not found. Please complete your profile setup.');
          }

          const { data: existingInvite } = await supabase
            .from('client_invitations')
            .select('id, status')
            .eq('client_email', invitationData.email.toLowerCase())
            .eq('professional_id', professional.id)
            .eq('invitation_target_type', 'client')
            .in('status', ['pending', 'sent'])
            .maybeSingle();

          if (existingInvite) {
            throw new Error('An active invitation already exists for this email address');
          }

          const { data: { session } } = await supabase.auth.getSession();

          const unifiedPayload: UnifiedInvitationPayload = {
            target: 'client',
            channel: invitationData.invitationType || 'email',
            recipient: {
              email: invitationData.email,
              name: invitationData.name,
              phone: invitationData.phone
            },
            context: {
              customMessage: invitationData.customMessage,
              templateType: invitationData.templateType || 'default'
            }
          };

          const headers: StandardInvitationHeaders = {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          };

          const { data, error } = await supabase.functions.invoke('send-invitation', {
            body: unifiedPayload,
            headers,
          });

          if (error) {
            throw new Error(error.message || 'Failed to send invitation');
          }

          if (!data?.success) {
            throw new Error(data?.error || 'Failed to send invitation');
          }

          return data;
        })(),
        15000,
        'Creating invitation'
      );
    },
    onSuccess: () => {
      toast.success('Client invitation sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, type }: { invitationId: string; type: 'email' | 'sms' | 'both' }) => {
      return withTimeout(
        (async () => {
          // Ensure we have a fresh session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session?.access_token) {
            throw new Error('Authentication session expired. Please refresh the page and try again.');
          }

          const headers: StandardInvitationHeaders = {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          };

          const { data, error } = await supabase.functions.invoke('manage-invitation', {
        body: { 
          invitationId, 
          action: 'resend',
          channel: type 
        },
            headers,
          });

          if (error) {
            console.error('Send invitation error:', error);
            throw new Error(error.message || 'Failed to send invitation');
          }

          if (!data?.success) {
            console.error('Send invitation failed:', data);
            throw new Error(data?.error || 'Failed to send invitation');
          }

          return data;
        })(),
        15000,
        'Sending invitation'
      );
    },
    onSuccess: (data) => {
      let sentType: string[] = [];
      if (data.emailSent) sentType.push('email');
      if (data.smsSent) sentType.push('SMS');
      toast.success(`Invitation sent via ${sentType.join(' & ')} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, type = 'email' }: { invitationId: string; type?: 'email' | 'sms' | 'both' }) => {
      // Ensure we have a fresh session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication session expired. Please refresh the page and try again.');
      }

      const headers: StandardInvitationHeaders = {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };

      const { data, error } = await supabase.functions.invoke('manage-invitation', {
        body: { 
          invitationId, 
          action: 'resend',
          channel: type 
        },
        headers,
      });

      if (error) {
        console.error('Resend invitation error:', error);
        throw new Error(error.message || 'Failed to resend invitation');
      }

      if (!data?.success) {
        console.error('Resend invitation failed:', data);
        throw new Error(data?.error || 'Failed to resend invitation');
      }

      return data;
    },
    onSuccess: (data) => {
      let sentType: string[] = [];
      if (data.emailSent) sentType.push('email');
      if (data.smsSent) sentType.push('SMS');
      toast.success(`Invitation resent via ${sentType.join(' & ')} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation');
    },
  });

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      // Ensure we have a fresh session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication session expired. Please refresh the page and try again.');
      }

      const headers: StandardInvitationHeaders = {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };

      const { data, error } = await supabase.functions.invoke('manage-invitation', {
        body: { 
          invitationId, 
          action: 'revoke'
        },
        headers,
      });

      if (error) {
        console.error('Revoke invitation error:', error);
        throw new Error(error.message || 'Failed to revoke invitation');
      }

      if (!data?.success) {
        console.error('Revoke invitation failed:', data);
        throw new Error(data?.error || 'Failed to revoke invitation');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Invitation revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke invitation: ${error.message}`);
    },
  });

  // Stats
  const stats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    sent: invitations.filter(i => i.status === 'sent').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired').length,
  };

  return {
    invitations,
    isLoading,
    stats,
    createInvitation: createInvitationMutation.mutateAsync,
    isCreatingInvitation: createInvitationMutation.isPending,
    sendInvitation: sendInvitationMutation.mutateAsync,
    isSendingInvitation: sendInvitationMutation.isPending,
    resendInvitation: resendInvitationMutation.mutateAsync,
    isResendingInvitation: resendInvitationMutation.isPending,
    revokeInvitation: revokeInvitationMutation.mutateAsync,
    isRevokingInvitation: revokeInvitationMutation.isPending,
  };
}