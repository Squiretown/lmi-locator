import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getValidSession } from '@/lib/auth/getValidSession';
import { toast } from 'sonner';

export type UnifiedClientStatus = 'invited' | 'active' | 'deactivated' | 'expired' | 'cancelled';

export interface UnifiedClient {
  id: string;
  source: 'client_profile' | 'invitation';
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: UnifiedClientStatus;
  
  // From client_profiles
  income?: number;
  householdSize?: number;
  firstTimeBuyer?: boolean;
  militaryStatus?: string;
  timeline?: string;
  notes?: string;
  
  // From user_invitations
  inviteCode?: string;
  inviteToken?: string;
  propertyInterest?: string;
  expiresAt?: string;
  sendVia?: string;
  emailSent?: boolean;
  smsSent?: boolean;
  
  createdAt: string;
  updatedAt?: string;
}

export interface UnifiedClientStats {
  total: number;
  invited: number;
  active: number;
  inactive: number;
}

export function useUnifiedClientData() {
  const queryClient = useQueryClient();

  // Fetch and merge both sources
  const { data: unifiedClients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['unified-clients'],
    queryFn: async () => {
      const { user } = await getValidSession();

      // Get professional ID
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professional) return [];

      // Fetch client profiles and invitations in parallel
      const [clientsResult, invitationsResult] = await Promise.all([
        supabase
          .from('client_profiles')
          .select('*')
          .eq('professional_id', professional.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_invitations')
          .select('*')
          .eq('invited_by_user_id', user.id)
          .eq('user_type', 'client')
          .order('created_at', { ascending: false })
      ]);

      const clients = clientsResult.data || [];
      const invitations = invitationsResult.data || [];

      // Merge into unified format
      const unified: UnifiedClient[] = [];
      const processedEmails = new Set<string>();

      // Add clients from client_profiles first (they take precedence)
      clients.forEach(client => {
        const email = client.email?.toLowerCase() || '';
        if (email) processedEmails.add(email);
        
        unified.push({
          id: client.id,
          source: 'client_profile',
          email: client.email || '',
          firstName: client.first_name,
          lastName: client.last_name,
          phone: client.phone,
          status: client.status === 'active' ? 'active' : 'deactivated',
          income: client.income,
          householdSize: client.household_size,
          firstTimeBuyer: client.first_time_buyer,
          militaryStatus: client.military_status,
          timeline: client.timeline,
          notes: client.notes,
          createdAt: client.created_at,
          updatedAt: client.updated_at,
        });
      });

      // Add invitations that haven't been accepted yet
      invitations.forEach(inv => {
        // Skip accepted invitations (they should be in client_profiles)
        if (inv.status === 'accepted') return;

        // Skip if email already exists in unified (avoid duplicates)
        const email = inv.email?.toLowerCase() || '';
        if (email && processedEmails.has(email)) return;
        if (email) processedEmails.add(email);

        // Map invitation status to unified status
        let status: UnifiedClientStatus;
        switch (inv.status) {
          case 'pending':
          case 'sent':
            status = 'invited';
            break;
          case 'expired':
            status = 'expired';
            break;
          case 'cancelled':
            status = 'cancelled';
            break;
          default:
            status = 'invited';
        }

        unified.push({
          id: inv.id,
          source: 'invitation',
          email: inv.email,
          firstName: inv.first_name,
          lastName: inv.last_name,
          phone: inv.phone,
          status,
          propertyInterest: inv.property_interest,
          inviteCode: inv.invite_code,
          inviteToken: inv.invite_token,
          expiresAt: inv.expires_at,
          sendVia: inv.send_via,
          emailSent: inv.email_sent,
          smsSent: inv.sms_sent,
          createdAt: inv.created_at,
        });
      });

      // Sort by created date descending
      return unified.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    staleTime: 30000,
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Invitation deleted');
      queryClient.invalidateQueries({ queryKey: ['unified-clients'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete invitation: ${error.message}`);
    },
  });

  // Reactivate client mutation
  const reactivateClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('client_profiles')
        .update({ status: 'active', deactivated_at: null, deactivated_by: null })
        .eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Client reactivated');
      queryClient.invalidateQueries({ queryKey: ['unified-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reactivate client: ${error.message}`);
    },
  });

  // Deactivate client mutation
  const deactivateClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { user } = await getValidSession();
      const { error } = await supabase
        .from('client_profiles')
        .update({ 
          status: 'deactivated', 
          deactivated_at: new Date().toISOString(),
          deactivated_by: user.id 
        })
        .eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Client deactivated');
      queryClient.invalidateQueries({ queryKey: ['unified-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to deactivate client: ${error.message}`);
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      // First delete team assignments
      await supabase
        .from('client_team_assignments')
        .delete()
        .eq('client_id', clientId);

      // Then delete client profile
      const { error } = await supabase
        .from('client_profiles')
        .delete()
        .eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Client deleted');
      queryClient.invalidateQueries({ queryKey: ['unified-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Invitation cancelled');
      queryClient.invalidateQueries({ queryKey: ['unified-clients'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel invitation: ${error.message}`);
    },
  });

  // Stats calculation
  const stats: UnifiedClientStats = {
    total: unifiedClients.length,
    invited: unifiedClients.filter(c => c.status === 'invited').length,
    active: unifiedClients.filter(c => c.status === 'active').length,
    inactive: unifiedClients.filter(c => ['deactivated', 'expired', 'cancelled'].includes(c.status)).length,
  };

  return {
    unifiedClients,
    isLoading,
    error,
    stats,
    refetch,
    deleteInvitation: deleteInvitationMutation.mutateAsync,
    reactivateClient: reactivateClientMutation.mutateAsync,
    deactivateClient: deactivateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    cancelInvitation: cancelInvitationMutation.mutateAsync,
    isDeleting: deleteInvitationMutation.isPending || deleteClientMutation.isPending,
    isReactivating: reactivateClientMutation.isPending,
    isDeactivating: deactivateClientMutation.isPending,
    isCancelling: cancelInvitationMutation.isPending,
  };
}
