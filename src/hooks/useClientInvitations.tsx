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

  // Fetch client invitations
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['client-invitations'],
    queryFn: async () => {
      try {
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
        .insert({
          professional_id: professional.id,
          ...invitationData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Invitation created with code: ${data.invitation_code}`);
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create invitation: ${error.message}`);
    },
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, type }: { invitationId: string; type: 'email' | 'sms' | 'both' }) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const { data, error } = await supabase.functions.invoke('send-client-invitation', {
          body: { invitationId, type },
          headers: { 'Content-Type': 'application/json' },
        });
        clearTimeout(timeoutId);
        if (error) throw new Error(error.message || 'Failed to send invitation');
        if (!data?.success || (!data.emailSent && !data.smsSent)) {
          throw new Error(data?.error || 'Failed to send invitation');
        }
        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (!data?.success || (!data.emailSent && !data.smsSent)) {
        toast.error('Failed to send invitation.');
        return;
      }
      const msg =
        data.emailSent && data.smsSent
          ? 'Invitation sent successfully via email and SMS'
          : data.emailSent
          ? 'Invitation sent successfully via email'
          : data.smsSent
          ? 'Invitation sent successfully via SMS'
          : '';
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        const { data, error } = await supabase.functions.invoke('send-client-invitation', {
          body: { invitationId, resend: true }
        });
        clearTimeout(timeoutId);
        if (error) throw new Error(error.message || 'Failed to resend invitation');
        if (!data?.success || (!data.emailSent && !data.smsSent)) {
          throw new Error(data?.error || 'Failed to resend invitation');
        }
        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
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