import { useUnifiedInvitationSystem } from './useUnifiedInvitationSystem';
import type { ClientInvitationData } from '@/types/unified-invitations';

// Legacy bridge hook - provides backwards compatible API
export function useUnifiedClientInvitations() {
  const {
    invitations,
    stats,
    isLoadingInvitations,
    isSending,
    isManaging,
    sendInvitation,
    manageInvitation
  } = useUnifiedInvitationSystem();

  // Adapt legacy create invitation function
  const createInvitation = async (data: CreateClientInvitationData) => {
    return sendInvitation({
      email: data.email,
      userType: 'client',
      firstName: data.name?.split(' ')[0],
      lastName: data.name?.split(' ').slice(1).join(' ') || undefined,
      phone: data.phone,
      sendVia: data.invitationType,
      customMessage: data.customMessage,
      propertyInterest: 'buying', // Default value
      preferredContact: 'email',
    } as ClientInvitationData);
  };

  // Adapt legacy resend/revoke functions
  const resendInvitation = (params: { invitationId: string; type?: string }) => 
    manageInvitation({ invitationId: params.invitationId, action: 'resend', sendVia: params.type as any });
  
  const revokeInvitation = (invitationId: string) => 
    manageInvitation({ invitationId, action: 'cancel' });

  // Transform invitations to legacy format
  const legacyInvitations = invitations.map(inv => ({
    ...inv,
    // Add legacy field mappings
    client_name: inv.first_name && inv.last_name ? 
      `${inv.first_name} ${inv.last_name}` : 
      inv.first_name || inv.last_name,
    client_email: inv.email,
    client_phone: inv.phone,
    invitation_code: inv.invite_code,
    invitation_type: inv.send_via,
  }));

  return {
    invitations: legacyInvitations,
    isLoading: isLoadingInvitations,
    stats,
    createInvitation,
    isCreatingInvitation: isSending,
    sendInvitation: () => {}, // Not used in unified system 
    isSendingInvitation: false,
    resendInvitation,
    isResendingInvitation: isManaging,
    revokeInvitation,
    isRevokingInvitation: isManaging,
  };
}

// Legacy types for backwards compatibility
export interface CreateClientInvitationData {
  email: string;
  name?: string;
  phone?: string;
  invitationType: 'email' | 'sms' | 'both';
  templateType?: string;
  customMessage?: string;
}