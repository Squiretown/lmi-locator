import type { UnifiedInvitationPayload, InvitationTarget, InvitationChannel } from '@/types/invitations';

/**
 * Creates a unified invitation payload with standardized structure
 */
export function createUnifiedInvitationPayload(
  target: InvitationTarget,
  channel: InvitationChannel,
  email: string,
  options: {
    name?: string;
    phone?: string;
    role?: string;
    customMessage?: string;
    templateType?: string;
    teamContext?: any;
  } = {}
): UnifiedInvitationPayload {
  return {
    target,
    channel,
    recipient: {
      email,
      name: options.name,
      phone: options.phone
    },
    context: {
      role: options.role,
      customMessage: options.customMessage,
      templateType: options.templateType || 'default',
      teamContext: options.teamContext
    }
  };
}

/**
 * Validates invitation payload structure
 */
export function validateInvitationPayload(payload: any): payload is UnifiedInvitationPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    ['client', 'professional'].includes(payload.target) &&
    ['email', 'sms', 'both'].includes(payload.channel) &&
    payload.recipient &&
    typeof payload.recipient.email === 'string' &&
    payload.recipient.email.length > 0
  );
}

/**
 * Creates standardized headers for invitation requests
 */
export function createInvitationHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}