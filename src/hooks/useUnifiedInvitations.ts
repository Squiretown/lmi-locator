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
  channel?: InvitationChannel;
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

      const payload = createUnifiedInvitationPayload(
        params.target,
        params.channel,
        params.email,
        {
          name: params.name,
          phone: params.phone,
          role: params.role,
          customMessage: params.customMessage,
          templateType: params.templateType,
          teamContext: params.teamContext
        }
      );

      const headers = createInvitationHeaders(session.access_token);

      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: payload,
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

      const { data, error } = await supabase.functions.invoke('manage-invitation', {
        body: params,
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