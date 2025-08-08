import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationData {
  client_email: string;
  client_name?: string;
  client_phone?: string;
  invitation_type: 'email' | 'sms' | 'both';
  template_type?: string;
  custom_message?: string;
}

export function useClientInvitations() {
  const queryClient = useQueryClient();

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

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: CreateInvitationData) => {
      return withTimeout(
        (async () => {
          const { data, error } = await supabase.functions.invoke('send-invitation', {
            body: {
              email: invitationData.client_email,
              type: 'client',
              clientName: invitationData.client_name,
              clientPhone: invitationData.client_phone,
              customMessage: invitationData.custom_message
            }
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
          // Get invitation details first
          const { data: invitation, error: fetchError } = await supabase
            .from('client_invitations')
            .select('*')
            .eq('id', invitationId)
            .single();

          if (fetchError || !invitation) {
            throw new Error('Invitation not found');
          }

          // Use the unified send-invitation function
          const { data, error } = await supabase.functions.invoke('send-invitation', {
            body: {
              email: invitation.client_email,
              type: invitation.invitation_target_type || 'client',
              clientName: invitation.client_name,
              clientPhone: invitation.client_phone,
              customMessage: invitation.custom_message
            }
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
        'Sending invitation'
      );
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  // Resend invitation mutation (same as send)
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return withTimeout(
        (async () => {
          // Get invitation details first
          const { data: invitation, error: fetchError } = await supabase
            .from('client_invitations')
            .select('*')
            .eq('id', invitationId)
            .single();

          if (fetchError || !invitation) {
            throw new Error('Invitation not found');
          }

          // Use the unified send-invitation function
          const { data, error } = await supabase.functions.invoke('send-invitation', {
            body: {
              email: invitation.client_email,
              type: invitation.invitation_target_type || 'client',
              clientName: invitation.client_name,
              clientPhone: invitation.client_phone,
              customMessage: invitation.custom_message
            }
          });

          if (error) {
            throw new Error(error.message || 'Failed to resend invitation');
          }

          if (!data?.success) {
            throw new Error(data?.error || 'Failed to resend invitation');
          }

          return data;
        })(),
        20000,
        'Resending invitation'
      );
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully');
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to resend invitation: ${error.message}`);
    },
  });

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase
        .from('client_invitations')
        .update({ status: 'revoked', updated_at: new Date().toISOString() })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;
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