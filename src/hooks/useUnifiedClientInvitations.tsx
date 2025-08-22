import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CreateInvitationRequest, UserType } from '@/types/unified-invitations';

export interface CreateClientInvitationData {
  email: string;
  name?: string;
  phone?: string;
  invitationType: 'email' | 'sms' | 'both';
  templateType?: string;
  customMessage?: string;
}

// Bridge interface to match legacy system
export interface ClientInvitation {
  id: string;
  professional_id: string;
  client_email: string;
  client_name?: string;
  client_phone?: string;
  invitation_code: string;
  invitation_type: 'email' | 'sms' | 'both';
  status: 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled';
  email_sent: boolean;
  sms_sent: boolean;
  sent_at?: string;
  accepted_at?: string;
  expires_at: string;
  template_type: string;
  custom_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Bridge hook to use the new unified invitation system
 * while maintaining compatibility with existing client management components
 */
export function useUnifiedClientInvitations() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({});

  // Fetch invitations from the new unified table
  const { data: rawInvitations = [], isLoading } = useQuery({
    queryKey: ['unified-client-invitations', filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('invited_by_user_id', session.user.id)
        .eq('user_type', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Transform unified invitations to legacy format for compatibility
  const invitations: ClientInvitation[] = rawInvitations.map(inv => ({
    id: inv.id,
    professional_id: inv.invited_by_user_id,
    client_email: inv.email,
    client_name: inv.first_name && inv.last_name ? `${inv.first_name} ${inv.last_name}` : inv.first_name,
    client_phone: inv.phone,
    invitation_code: inv.invite_code,
    invitation_type: inv.send_via as 'email' | 'sms' | 'both',
    status: (inv.status === 'cancelled' ? 'cancelled' : inv.status) as 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled',
    email_sent: inv.email_sent || false,
    sms_sent: inv.sms_sent || false,
    sent_at: inv.sent_at,
    accepted_at: inv.accepted_at,
    expires_at: inv.expires_at,
    template_type: 'default',
    custom_message: inv.custom_message,
    created_at: inv.created_at,
    updated_at: inv.created_at, // Use created_at as fallback
  }));

  // Create invitation using unified system
  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: CreateClientInvitationData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Check for existing invitation
      const { data: existing } = await supabase
        .from('user_invitations')
        .select('id, status')
        .eq('email', invitationData.email.toLowerCase())
        .eq('invited_by_user_id', session.user.id)
        .eq('user_type', 'client')
        .in('status', ['pending', 'sent'])
        .maybeSingle();

      if (existing) {
        throw new Error('An active invitation already exists for this email address');
      }

      // Create unified invitation request (client-specific)
      const unifiedRequest = {
        email: invitationData.email,
        userType: 'client' as const,
        firstName: invitationData.name?.split(' ')[0],
        lastName: invitationData.name?.split(' ').slice(1).join(' '),
        phone: invitationData.phone,
        sendVia: invitationData.invitationType,
        customMessage: invitationData.customMessage,
        // Client-specific fields required for the union type
        propertyInterest: 'buying' as const,
        preferredContact: 'email' as const,
      } satisfies CreateInvitationRequest;

      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: unifiedRequest,
        headers: {
          'X-Supabase-Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (error) throw new Error(error.message || 'Failed to send invitation');
      if (!data?.success) throw new Error(data?.error || 'Failed to send invitation');

      return data;
    },
    onSuccess: () => {
      toast.success('Client invitation sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['unified-client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  // Resend invitation using unified system
  const resendInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, type = 'email' }: { invitationId: string; type?: 'email' | 'sms' | 'both' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('manage-user-invitation', {
        body: { 
          invitationId, 
          action: 'resend',
          sendVia: type
        },
        headers: {
          'X-Supabase-Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (error) throw new Error(error.message || 'Failed to resend invitation');
      if (!data?.success) throw new Error(data?.error || 'Failed to resend invitation');

      return data;
    },
    onSuccess: (data) => {
      let sentType: string[] = [];
      if (data.emailSent) sentType.push('email');
      if (data.smsSent) sentType.push('SMS');
      toast.success(`Invitation resent via ${sentType.join(' & ')} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['unified-client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation');
    },
  });

  // Revoke invitation using unified system
  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('manage-user-invitation', {
        body: { 
          invitationId, 
          action: 'cancel'  // Note: unified system uses 'cancel' not 'revoke'
        },
        headers: {
          'X-Supabase-Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (error) throw new Error(error.message || 'Failed to cancel invitation');
      if (!data?.success) throw new Error(data?.error || 'Failed to cancel invitation');

      return data;
    },
    onSuccess: () => {
      toast.success('Invitation cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['unified-client-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel invitation: ${error.message}`);
    },
  });

  // Legacy compatibility methods
  const sendInvitationMutation = resendInvitationMutation;

  // Stats calculation
  const stats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    sent: invitations.filter(i => i.status === 'sent').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired').length,
    revoked: invitations.filter(inv => inv.status === 'cancelled').length,
  };

  return {
    invitations,
    isLoading,
    stats,
    
    // Core actions (unified system)
    createInvitation: createInvitationMutation.mutateAsync,
    isCreatingInvitation: createInvitationMutation.isPending,
    
    // Legacy compatibility actions
    sendInvitation: sendInvitationMutation.mutateAsync,
    isSendingInvitation: sendInvitationMutation.isPending,
    resendInvitation: resendInvitationMutation.mutateAsync,
    isResendingInvitation: resendInvitationMutation.isPending,
    revokeInvitation: revokeInvitationMutation.mutateAsync,
    isRevokingInvitation: revokeInvitationMutation.isPending,

    // Filters (for compatibility)
    filters,
    setFilters,
  };
}