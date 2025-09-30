import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UnifiedInvitationPayload, InvitationTarget, InvitationChannel } from '@/types/invitations';
import { createUnifiedInvitationPayload, createInvitationHeaders } from '@/lib/utils/invitationUtils';

interface SendInvitationParams {
  target: InvitationTarget;
  channel: InvitationChannel;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  customMessage?: string;
  templateType?: string;
  teamContext?: any;
}

interface ManageInvitationParams {
  invitationId: string;
  action: 'resend' | 'revoke';
  type?: InvitationChannel;
}

/**
 * Unified hook for managing all types of invitations
 * Provides consistent API for both client and professional invitations
 */
export function useUnifiedInvitations() {
  const queryClient = useQueryClient();

  // Send new invitation
  const sendInvitationMutation = useMutation({
    mutationFn: async (params: SendInvitationParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const headers = createInvitationHeaders(session.access_token);

      const nameParts = params.name?.split(' ') || [];
      
      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: params.email,
          userType: params.target === 'client' ? 'client' : params.role || 'realtor',
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          phone: params.phone,
          sendVia: params.channel,
          customMessage: params.customMessage,
          professionalType: params.role !== 'client' ? params.role : undefined,
        },
        headers
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send invitation');

      return data;
    },
    onSuccess: (data, variables) => {
      const targetType = variables.target === 'client' ? 'client' : 'professional';
      toast.success(`${targetType} invitation sent successfully!`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['professional-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    }
  });

  // Manage existing invitation (resend/revoke)
  const manageInvitationMutation = useMutation({
    mutationFn: async (params: ManageInvitationParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const headers = createInvitationHeaders(session.access_token);

      const { data, error } = await supabase.functions.invoke('manage-user-invitation', {
        body: {
          invitationId: params.invitationId,
          action: params.action,
          sendVia: params.type
        },
        headers
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || `Failed to ${params.action} invitation`);

      return data;
    },
    onSuccess: (data, variables) => {
      const action = variables.action === 'resend' ? 'resent' : 'revoked';
      toast.success(`Invitation ${action} successfully!`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['professional-invitations'] });
    },
    onError: (error: Error, variables) => {
      toast.error(`Failed to ${variables.action} invitation: ${error.message}`);
    }
  });

  return {
    sendInvitation: sendInvitationMutation.mutateAsync,
    manageInvitation: manageInvitationMutation.mutateAsync,
    isSending: sendInvitationMutation.isPending,
    isManaging: manageInvitationMutation.isPending
  };
}