// Unified Invitation System Types

export type UserType = 'client' | 'realtor' | 'mortgage_professional';
export type InvitationStatus = 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled';
export type SendVia = 'email' | 'sms' | 'both';
export type PropertyInterest = 'buying' | 'selling' | 'refinancing';
export type ProfessionalType = 'realtor' | 'mortgage_broker' | 'lender';
export type PreferredContact = 'email' | 'phone' | 'text';

export interface BaseInvitationData {
  email: string;
  userType: UserType;
  firstName?: string;
  lastName?: string;
  phone?: string;
  sendVia?: SendVia;
  customMessage?: string;
}

export interface ClientInvitationData extends BaseInvitationData {
  userType: 'client';
  propertyInterest: PropertyInterest;
  estimatedBudget?: number;
  preferredContact?: PreferredContact;
}

export interface ProfessionalInvitationData extends BaseInvitationData {
  userType: 'realtor' | 'mortgage_professional';
  professionalType: ProfessionalType;
  licenseNumber?: string;
  licenseState?: string;
  companyName?: string;
  yearsExperience?: number;
  serviceAreas?: string[];
  specializations?: string[];
  requiresApproval?: boolean;
}

export type CreateInvitationRequest = ClientInvitationData | ProfessionalInvitationData;

export interface UserInvitation {
  id: string;
  email: string;
  invite_token: string;
  invite_code: string;
  invited_by_user_id: string;
  invited_by_name?: string;
  user_type: UserType;
  status: InvitationStatus;
  first_name?: string;
  last_name?: string;
  phone?: string;
  send_via: SendVia;
  custom_message?: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  sent_at?: string;
  last_reminder_sent?: string;
  email_sent: boolean;
  sms_sent: boolean;
  attempts: number;
  metadata: Record<string, any>;
  
  // Client-specific fields
  property_interest?: PropertyInterest;
  estimated_budget?: number;
  preferred_contact?: PreferredContact;
  
  // Professional-specific fields
  professional_type?: ProfessionalType;
  license_number?: string;
  license_state?: string;
  company_name?: string;
  years_experience?: number;
  service_areas?: any;
  specializations?: any;
  requires_approval?: boolean;
}

export interface InvitationStats {
  total: number;
  pending: number;
  sent: number;
  accepted: number;
  expired: number;
  cancelled: number;
}

export interface SendInvitationResponse {
  success: boolean;
  invitationId: string;
  inviteCode: string;
  inviteToken: string;
  emailSent: boolean;
  smsSent: boolean;
  message: string;
}

export interface ValidateInvitationResponse {
  valid: boolean;
  error?: string;
  code?: string;
  invitation?: {
    id: string;
    email: string;
    userType: UserType;
    firstName?: string;
    lastName?: string;
    phone?: string;
    customMessage?: string;
    invitedBy?: string;
    expiresAt: string;
    
    // Type-specific fields
    propertyInterest?: PropertyInterest;
    estimatedBudget?: number;
    preferredContact?: PreferredContact;
    professionalType?: ProfessionalType;
    licenseNumber?: string;
    licenseState?: string;
    companyName?: string;
    yearsExperience?: number;
    serviceAreas?: string[];
    specializations?: string[];
    requiresApproval?: boolean;
  };
}

export interface AcceptInvitationRequest {
  token: string;
  email: string;
  password: string;
  userData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface AcceptInvitationResponse {
  success: boolean;
  userId: string;
  userType: UserType;
  email: string;
  message: string;
}

export interface ManageInvitationRequest {
  invitationId: string;
  action: 'resend' | 'cancel';
  sendVia?: SendVia;
}

export interface ManageInvitationResponse {
  success: boolean;
  emailSent?: boolean;
  smsSent?: boolean;
  message: string;
}

// Form validation schemas
export interface InvitationFormData extends Omit<CreateInvitationRequest, 'userType'> {
  userType: UserType;
}

export interface InvitationFilters {
  status?: InvitationStatus[];
  userType?: UserType[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Audit log interface
export interface InvitationAuditLog {
  id: string;
  invitation_id: string;
  action: string;
  details: Record<string, any>;
  performed_by?: string;
  performed_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Error codes for invitation validation
export type InvitationErrorCode = 
  | 'NOT_FOUND'
  | 'ALREADY_ACCEPTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'INVALID_EMAIL'
  | 'DUPLICATE_PENDING';