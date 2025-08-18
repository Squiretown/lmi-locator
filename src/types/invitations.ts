export type InvitationTarget = 'client' | 'professional';
export type InvitationChannel = 'email' | 'sms' | 'both';

export interface UnifiedInvitationPayload {
  target: InvitationTarget;
  channel: InvitationChannel;
  recipient: {
    email: string;
    name?: string;
    phone?: string;
  };
  context?: {
    role?: string;
    customMessage?: string;
    teamContext?: any;
    templateType?: string;
  };
  invitationId?: string; // For resend operations
}

export interface InvitationResponse {
  success: boolean;
  invitationId?: string;
  emailId?: string;
  emailSent?: boolean;
  smsSent?: boolean;
  message?: string;
  error?: string;
}

export interface StandardInvitationHeaders {
  Authorization: string;
  'Content-Type': 'application/json';
  [key: string]: string;
}