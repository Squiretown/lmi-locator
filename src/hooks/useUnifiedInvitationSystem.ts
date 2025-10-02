// FILE: src/hooks/useUnifiedInvitationSystem.ts
// CRITICAL FIX: Always refresh session before calling edge functions

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getValidSession } from '@/lib/auth/getValidSession';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';
import { toast } from 'sonner';
import type {
  UserInvitation,
  CreateInvitationRequest,
  SendInvitationResponse,
  ManageInvitationRequest,
  ValidateInvitationRequest,
  ValidateInvitationResponse,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  InvitationFilters,
  InvitationStats,
  UserType,
  InvitationStatus
} from '@/types/unified-invitations';

export function useUnifiedInvitationSystem() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<InvitationFilters>({});

  // Fetch invitations with filters
  const {
    data: invitations = [],
    isLoading: isLoadingInvitations,
    error: invitationsError,
    refetch: refetchInvitations
  } = useQuery({
    queryKey: ['user-invitations', filters],
    queryFn: async () => {
      const { user } = await getValidSession();

      let query = supabase
        .from('user_invitations')
        .select('*')
        .eq('invited_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.userType && filters.userType.length > 0) {
        query = query.in('user_type', filters.userType);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check for expired invitations and update them
      const now = new Date();
      const expiredInvitations = (data || []).filter(
        i => i.status === 'pending' && new Date(i.expires_at) < now
      );

      if (expiredInvitations.length > 0) {
        // Update expired invitations in background (don't await to prevent UI freeze)
        supabase
          .from('user_invitations')
          .update({ status: 'expired' })
          .in('id', expiredInvitations.map(i => i.id))
          .then(() => {
            // Silently refetch after updating expired invitations
            queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
          });
      }

      // Apply search filter on client side
      let filteredData = (data || []) as UserInvitation[];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(invitation =>
          invitation.email.toLowerCase().includes(searchLower) ||
          invitation.first_name?.toLowerCase().includes(searchLower) ||
          invitation.last_name?.toLowerCase().includes(searchLower) ||
          invitation.invite_code.toLowerCase().includes(searchLower)
        );
      }

      return filteredData;
    },
    retry: 2,
    staleTime: 30000,
  });

  // Calculate stats
  const stats: InvitationStats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    sent: invitations.filter(i => i.email_sent === true).length, // Cumulative metric: all successfully delivered emails
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired').length,
    cancelled: invitations.filter(i => i.status === 'cancelled').length,
  };

  // Send new invitation
  const sendInvitationMutation = useMutation({
    mutationFn: async (request: CreateInvitationRequest): Promise<SendInvitationResponse> => {
      console.log('=== SEND INVITATION START ===');
      
      console.log('Preparing invitation request:', {
        email: request.email,
        userType: request.userType,
        sendVia: (request as any).sendVia || 'email'
      });

      // Prepare payload
      const payload = {
        email: request.email,
        userType: request.userType,
        firstName: (request as any).firstName,
        lastName: (request as any).lastName,
        phone: (request as any).phone,
        sendVia: (request as any).sendVia || 'email',
        customMessage: request.customMessage,
        
        // Client-specific
        propertyInterest: (request as any).propertyInterest,
        estimatedBudget: (request as any).estimatedBudget,
        preferredContact: (request as any).preferredContact,
        
        // Professional-specific
        professionalType: (request as any).professionalType,
        licenseNumber: (request as any).licenseNumber,
        licenseState: (request as any).licenseState,
        companyName: (request as any).companyName,
        yearsExperience: (request as any).yearsExperience,
        serviceAreas: (request as any).serviceAreas,
        specializations: (request as any).specializations,
        requiresApproval: (request as any).requiresApproval,
      };

      console.log('Calling edge function with payload:', payload);

      // ✅ FIXED: Using invokeEdgeFunction which includes auth header
      const { data, error } = await invokeEdgeFunction('send-user-invitation', payload);

      console.log('Edge function response:', { 
        success: !!data?.success, 
        error: error?.message,
        data 
      });

      // Handle errors
      if (error) {
        console.error('Edge function error details:', {
          message: error.message,
          context: error.context,
          name: error.name,
          stack: error.stack
        });
        
        // Provide specific error messages based on error type
        if (error.message?.includes('FunctionInvokeError')) {
          throw new Error('EDGE_FUNCTION_NOT_DEPLOYED');
        }
        if (error.message?.includes('FunctionsRelayError') || error.message?.includes('FunctionsFetchError')) {
          throw new Error('EDGE_FUNCTION_NETWORK_ERROR');
        }
        if (error.message?.includes('timeout')) {
          throw new Error('EDGE_FUNCTION_TIMEOUT');
        }
        if (error.message?.includes('Authorization')) {
          throw new Error('AUTHENTICATION_FAILED');
        }
        
        throw new Error(error.message || 'EDGE_FUNCTION_ERROR');
      }

      if (!data?.success) {
        console.error('Edge function returned failure:', data);
        throw new Error(data?.error || 'INVITATION_CREATION_FAILED');
      }

      console.log('Invitation created successfully:', {
        invitationId: data.invitationId,
        inviteCode: data.inviteCode,
        emailSent: data.emailSent
      });

      console.log('=== SEND INVITATION END ===');
      return data;
    },
    onSuccess: (data, variables) => {
      if (!data.emailSent && data.inviteCode) {
        toast.success('Invitation created!', {
          description: `Email failed to send. Share this code: ${data.inviteCode}`,
          duration: 10000,
          action: {
            label: 'Copy Code',
            onClick: () => {
              navigator.clipboard.writeText(data.inviteCode);
              toast.success('Code copied!');
            }
          }
        });
      } else {
        toast.success(`${variables.userType} invitation sent!`, {
          description: data.inviteCode ? `Invite code: ${data.inviteCode}` : undefined
        });
      }

      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
    onError: (error: Error) => {
      console.error('Send invitation mutation error:', error);
      
      const errorMessages: Record<string, string> = {
        'AUTHENTICATION_REQUIRED': 'Please sign in to send invitations',
        'AUTHENTICATION_FAILED': 'Session expired. Please refresh the page and try again.',
        'MISSING_REQUIRED_FIELDS': 'Email and user type are required',
        'DUPLICATE_INVITATION': 'An invitation is already pending for this email',
        'EDGE_FUNCTION_NOT_DEPLOYED': 'System error: invitation service unavailable. Please contact support.',
        'EDGE_FUNCTION_NETWORK_ERROR': 'Network error. Please check your connection and try again.',
        'EDGE_FUNCTION_TIMEOUT': 'Request timed out. Please try again.',
        'EDGE_FUNCTION_ERROR': 'Failed to send invitation. Please try again.',
        'INVITATION_CREATION_FAILED': 'Failed to create invitation. Please contact support.'
      };

      const message = errorMessages[error.message] || error.message;
      toast.error(message, {
        duration: 5000
      });
    },
    retry: false,
  });

  // Manage invitation (resend/cancel)
  const manageInvitationMutation = useMutation({
    mutationFn: async (request: ManageInvitationRequest) => {
      console.log('=== MANAGE INVITATION START ===');
      console.log('Managing invitation:', request);

      // ✅ FIXED: Using invokeEdgeFunction
      const { data, error } = await invokeEdgeFunction('manage-user-invitation', request);

      console.log('Manage invitation response:', { data, error });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to manage invitation');

      console.log('=== MANAGE INVITATION END ===');
      return data;
    },
    onSuccess: (data, variables) => {
      const actionText = variables.action === 'resend' ? 'resent' : 'cancelled';
      toast.success(`Invitation ${actionText} successfully`);
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
    onError: (error: Error) => {
      console.error('Manage invitation error:', error);
      toast.error(error.message || 'Failed to update invitation');
    }
  });

  // Validate invitation (by token or code)
  const validateInvitationMutation = useMutation({
    mutationFn: async (request: ValidateInvitationRequest): Promise<ValidateInvitationResponse> => {
      const { token, code } = request;
      // Note: Validation doesn't require auth since it's used by non-logged-in users
      const { data, error } = await supabase.functions.invoke('validate-user-invitation', {
        body: token ? { token } : { code }
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      console.error('Validate invitation error:', error);
      toast.error(`Invalid invitation: ${error.message}`);
    }
  });

  // Accept invitation (for new users)
  const acceptInvitationMutation = useMutation({
    mutationFn: async (request: AcceptInvitationRequest): Promise<AcceptInvitationResponse> => {
      // Note: Accept doesn't require auth since user is creating account
      const { data, error } = await supabase.functions.invoke('accept-user-invitation', {
        body: request
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to accept invitation');

      return data;
    },
    onSuccess: (data) => {
      toast.success('Welcome! Your account has been created successfully.');
    },
    onError: (error: Error) => {
      console.error('Accept invitation error:', error);
      toast.error(`Failed to accept invitation: ${error.message}`);
    }
  });

  // Utility functions
  const getInvitationsByType = (userType: UserType): UserInvitation[] => {
    return invitations.filter(invitation => invitation.user_type === userType);
  };

  const getInvitationsByStatus = (status: InvitationStatus): UserInvitation[] => {
    return invitations.filter(invitation => invitation.status === status);
  };

  const updateFilters = (newFilters: Partial<InvitationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const copyInvitationLink = (invitation: UserInvitation) => {
    const baseUrl = window.location.origin;
    const acceptUrl = `${baseUrl}/accept-invitation/${invitation.invite_token}`;
    navigator.clipboard.writeText(acceptUrl);
    toast.success('Invitation link copied to clipboard!');
  };

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invitation code copied to clipboard!');
  };

  return {
    // Data
    invitations,
    stats,
    filters,
    
    // Loading states
    isLoadingInvitations,
    isSending: sendInvitationMutation.isPending,
    isManaging: manageInvitationMutation.isPending,
    isValidating: validateInvitationMutation.isPending,
    isAccepting: acceptInvitationMutation.isPending,
    
    // Error states
    invitationsError,
    
    // Actions
    sendInvitation: sendInvitationMutation.mutateAsync,
    manageInvitation: manageInvitationMutation.mutateAsync,
    validateInvitation: validateInvitationMutation.mutateAsync,
    acceptInvitation: acceptInvitationMutation.mutateAsync,
    
    // Utilities
    getInvitationsByType,
    getInvitationsByStatus,
    updateFilters,
    clearFilters,
    copyInvitationLink,
    copyInvitationCode,
    refetchInvitations,
  };
}

// Export hook for invitation acceptance flow (public, no auth required)
export function useInvitationAcceptance() {
  const { validateInvitation, acceptInvitation, isValidating, isAccepting } = useUnifiedInvitationSystem();
  
  return {
    validateInvitation,
    acceptInvitation,
    isValidating,
    isAccepting,
  };
}