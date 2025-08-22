import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  UserInvitation,
  CreateInvitationRequest,
  SendInvitationResponse,
  ValidateInvitationResponse,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  ManageInvitationRequest,
  ManageInvitationResponse,
  InvitationStats,
  InvitationFilters,
  UserType,
  InvitationStatus
} from '@/types/unified-invitations';

/**
 * Unified hook for managing all types of invitations
 * Replaces the old separate client/professional invitation systems
 */
export function useUnifiedInvitationSystem() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<InvitationFilters>({});

  // Fetch invitations with filtering
  const {
    data: invitations = [],
    isLoading: isLoadingInvitations,
    error: invitationsError,
    refetch: refetchInvitations
  } = useQuery({
    queryKey: ['user-invitations', filters],
    queryFn: async (): Promise<UserInvitation[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      let query = supabase
        .from('user_invitations')
        .select('*')
        .eq('invited_by_user_id', session.user.id)
        .order('created_at', { ascending: false });

      // Apply filters
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

      // Apply search filter on client side (for now) and cast types
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
    staleTime: 30000, // 30 seconds
  });

  // Calculate stats from invitations
  const stats: InvitationStats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    sent: invitations.filter(i => i.status === 'sent').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired').length,
    cancelled: invitations.filter(i => i.status === 'cancelled').length,
  };

  // Send new invitation
  const sendInvitationMutation = useMutation({
    mutationFn: async (request: CreateInvitationRequest): Promise<SendInvitationResponse> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: request,
        headers: {
          'X-Supabase-Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        const errorMsg = error.message || error.context?.json?.error || 'Failed to send invitation';
        throw new Error(errorMsg);
      }
      if (!data?.success) {
        const errorMsg = data?.error || 'Failed to send invitation';
        throw new Error(errorMsg);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.userType} invitation sent!`, {
        description: data.inviteCode ? `Invite code: ${data.inviteCode}` : undefined
      });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
    onError: (error: Error) => {
      console.error('Failed to send invitation:', error);
      const message = error.message;
      if (message.includes('already exists') || message.includes('pending invitation')) {
        toast.error('A pending invitation already exists for this email.');
      } else if (message.includes('Email and user type are required')) {
        toast.error('Email and user type are required.');
      } else {
        toast.error(`Failed to send invitation: ${message}`);
      }
    }
  });

  // Manage existing invitation (resend/cancel)
  const manageInvitationMutation = useMutation({
    mutationFn: async (request: ManageInvitationRequest): Promise<ManageInvitationResponse> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('manage-user-invitation', {
        body: request,
        headers: {
          'X-Supabase-Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        const errorMsg = error.message || error.context?.json?.error || `Failed to ${request.action} invitation`;
        throw new Error(errorMsg);
      }
      if (!data?.success) {
        const errorMsg = data?.error || `Failed to ${request.action} invitation`;
        throw new Error(errorMsg);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      const action = variables.action === 'resend' ? 'resent' : 'cancelled';
      toast.success(`Invitation ${action} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
    onError: (error: Error, variables) => {
      console.error(`Failed to ${variables.action} invitation:`, error);
      toast.error(`Failed to ${variables.action} invitation: ${error.message}`);
    }
  });

  // Validate invitation (for acceptance flow)
  const validateInvitationMutation = useMutation({
    mutationFn: async (tokenOrCode: string): Promise<ValidateInvitationResponse> => {
      const isToken = tokenOrCode.length > 10; // Tokens are longer than codes
      
      const { data, error } = await supabase.functions.invoke('validate-user-invitation', {
        body: isToken ? { token: tokenOrCode } : { code: tokenOrCode }
      });

      if (error) throw error;
      
      return data;
    },
    onError: (error: Error) => {
      console.error('Failed to validate invitation:', error);
      toast.error(`Invalid invitation: ${error.message}`);
    }
  });

  // Accept invitation (for new users)
  const acceptInvitationMutation = useMutation({
    mutationFn: async (request: AcceptInvitationRequest): Promise<AcceptInvitationResponse> => {
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
      console.error('Failed to accept invitation:', error);
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

  // Helper function to copy invitation link
  const copyInvitationLink = (invitation: UserInvitation) => {
    const baseUrl = window.location.origin;
    const acceptUrl = `${baseUrl}/accept-invitation/${invitation.invite_token}`;
    navigator.clipboard.writeText(acceptUrl);
    toast.success('Invitation link copied to clipboard!');
  };

  // Helper function to copy invitation code
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

// Separate hook for invitation acceptance flow (public, no auth required)
export function useInvitationAcceptance() {
  const { validateInvitation, acceptInvitation, isValidating, isAccepting } = useUnifiedInvitationSystem();
  
  return {
    validateInvitation,
    acceptInvitation,
    isValidating,
    isAccepting,
  };
}