import { useState } from 'react';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientInvitation[];
    },
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: CreateInvitationData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('client_invitations')
        .insert({
          professional_id: user.id,
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
      console.log('🚀 Starting invitation send:', { invitationId, type });
      console.log('📡 Supabase client status:', supabase ? 'Ready' : 'Not initialized');
      
      // Call edge function to send invitation with shorter timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout triggered');
        controller.abort();
      }, 15000); // Reduced to 15 seconds
      
      try {
        console.log('📞 Calling edge function: send-client-invitation');
        
        const { data, error } = await supabase.functions.invoke('send-client-invitation', {
          body: { invitationId, type },
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        console.log('📬 Edge function response:', { data, error });

        if (error) {
          console.error('❌ Edge function error:', error);
          throw new Error(error.message || 'Failed to send invitation');
        }
        
        if (!data?.success) {
          console.error('❌ Edge function returned failure:', data);
          throw new Error(data?.error || 'Failed to send invitation');
        }
        
        console.log('✅ Invitation sent successfully:', data);
        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('💥 Send invitation error:', err);
        
        if (err.name === 'AbortError') {
          throw new Error('Request timed out - please try again');
        }
        if (err.message?.includes('Failed to fetch')) {
          throw new Error('Network error - please check your connection and try again');
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      const message = data?.emailSent && data?.smsSent 
        ? 'Invitation sent successfully via email and SMS'
        : data?.emailSent 
        ? 'Invitation sent successfully via email'
        : data?.smsSent
        ? 'Invitation sent successfully via SMS'
        : 'Invitation sent successfully';
      
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      console.error('Send invitation error:', error);
      
      let errorMessage = error.message;
      if (errorMessage.includes('not configured')) {
        errorMessage = 'Email service is not configured. Please contact your administrator.';
      } else if (errorMessage.includes('timed out')) {
        errorMessage = 'The request is taking longer than expected. Please try again.';
      }
      
      toast.error(`Failed to send invitation: ${errorMessage}`);
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      console.log('Resending invitation:', invitationId);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      try {
        const { data, error } = await supabase.functions.invoke('send-client-invitation', {
          body: { invitationId, resend: true }
        });

        clearTimeout(timeoutId);

        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message || 'Failed to resend invitation');
        }
        
        if (!data?.success) {
          throw new Error(data?.error || 'Failed to resend invitation');
        }
        
        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('Request timed out - the system may be experiencing issues');
        }
        throw err;
      }
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully');
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: Error) => {
      console.error('Resend invitation error:', error);
      
      let errorMessage = error.message;
      if (errorMessage.includes('not configured')) {
        errorMessage = 'Email service is not configured. Please contact your administrator.';
      } else if (errorMessage.includes('timed out')) {
        errorMessage = 'The request is taking longer than expected. Please try again.';
      }
      
      toast.error(`Failed to resend invitation: ${errorMessage}`);
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

  // Get invitation statistics
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