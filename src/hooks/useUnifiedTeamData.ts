import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getValidSession } from '@/lib/auth/getValidSession';
import { toast } from 'sonner';

export type UnifiedTeamStatus = 'invited' | 'active' | 'inactive' | 'expired' | 'cancelled';

export interface UnifiedTeamMember {
  id: string;
  source: 'professional_teams' | 'lending_teams' | 'invitation';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  licenseNumber?: string;
  professionalType: 'realtor' | 'mortgage_professional';
  status: UnifiedTeamStatus;
  role?: string;
  notes?: string;
  
  // From invitation
  inviteCode?: string;
  inviteToken?: string;
  expiresAt?: string;
  sendVia?: string;
  
  createdAt: string;
}

export interface UnifiedTeamStats {
  total: number;
  invited: number;
  active: number;
  inactive: number;
}

export function useUnifiedTeamData() {
  const queryClient = useQueryClient();

  // Get current professional type
  const { data: currentProfessional } = useQuery({
    queryKey: ['current-professional-type'],
    queryFn: async () => {
      const { user } = await getValidSession();
      const { data } = await supabase
        .from('professionals')
        .select('id, professional_type, name, company')
        .eq('user_id', user.id)
        .single();
      return data;
    },
  });

  // Fetch and merge team data from all sources
  const { data: unifiedTeam = [], isLoading, error, refetch } = useQuery({
    queryKey: ['unified-team', currentProfessional?.id],
    queryFn: async () => {
      const { user } = await getValidSession();

      if (!currentProfessional?.id) return [];

      const isMortgagePro = currentProfessional.professional_type === 'mortgage_professional';
      const targetType = isMortgagePro ? 'realtor' : 'mortgage_professional';

      // Fetch professional_teams (realtor partnerships)
      const professionalTeamsPromise = isMortgagePro
        ? supabase
            .from('professional_teams')
            .select(`
              id,
              role,
              notes,
              status,
              created_at,
              realtor_id
            `)
            .eq('mortgage_professional_id', currentProfessional.id)
            .eq('status', 'active')
        : supabase
            .from('professional_teams')
            .select(`
              id,
              role,
              notes,
              status,
              created_at,
              mortgage_professional_id
            `)
            .eq('realtor_id', currentProfessional.id)
            .eq('status', 'active');

      // Fetch professional invitations (pending team invites)
      const invitationsPromise = supabase
        .from('user_invitations')
        .select('*')
        .eq('invited_by_user_id', user.id)
        .in('user_type', ['realtor', 'mortgage_professional'])
        .order('created_at', { ascending: false });

      const [teamsResult, invitationsResult] = await Promise.all([
        professionalTeamsPromise,
        invitationsPromise,
      ]);

      const teams = teamsResult.data || [];
      const invitations = invitationsResult.data || [];

      // Get partner professional details for teams
      const partnerIds = teams.map(t => isMortgagePro ? t.realtor_id : t.mortgage_professional_id).filter(Boolean);
      
      let partnersMap = new Map();
      if (partnerIds.length > 0) {
        const { data: partners } = await supabase
          .from('professionals')
          .select('id, name, email, phone, company, license_number, professional_type')
          .in('id', partnerIds);
        
        partners?.forEach(p => partnersMap.set(p.id, p));
      }

      // Merge into unified format
      const unified: UnifiedTeamMember[] = [];
      const processedEmails = new Set<string>();

      // Add active team members from professional_teams
      teams.forEach(team => {
        const partnerId = isMortgagePro ? team.realtor_id : team.mortgage_professional_id;
        const partner = partnersMap.get(partnerId);
        if (!partner) return;

        const email = partner.email?.toLowerCase() || '';
        if (email) processedEmails.add(email);

        unified.push({
          id: team.id,
          source: 'professional_teams',
          name: partner.name,
          email: partner.email || '',
          phone: partner.phone,
          company: partner.company,
          licenseNumber: partner.license_number,
          professionalType: partner.professional_type as 'realtor' | 'mortgage_professional',
          status: 'active',
          role: team.role,
          notes: team.notes,
          createdAt: team.created_at,
        });
      });

      // Add invitations that haven't been accepted yet
      invitations.forEach(inv => {
        // Skip accepted invitations (they should be in professional_teams)
        if (inv.status === 'accepted') return;

        // Skip if email already exists
        const email = inv.email?.toLowerCase() || '';
        if (email && processedEmails.has(email)) return;
        if (email) processedEmails.add(email);

        // Map invitation status
        let status: UnifiedTeamStatus;
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
          name: inv.first_name && inv.last_name 
            ? `${inv.first_name} ${inv.last_name}` 
            : inv.email.split('@')[0],
          email: inv.email,
          phone: inv.phone,
          company: inv.company_name,
          professionalType: (inv.professional_type || inv.user_type) as 'realtor' | 'mortgage_professional',
          status,
          inviteCode: inv.invite_code,
          inviteToken: inv.invite_token,
          expiresAt: inv.expires_at,
          sendVia: inv.send_via,
          createdAt: inv.created_at,
        });
      });

      // Sort by created date descending
      return unified.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: !!currentProfessional?.id,
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
      queryClient.invalidateQueries({ queryKey: ['unified-team'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete invitation: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['unified-team'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel invitation: ${error.message}`);
    },
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('professional_teams')
        .update({ status: 'inactive' })
        .eq('id', teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Team member removed');
      queryClient.invalidateQueries({ queryKey: ['unified-team'] });
      queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    },
  });

  // Stats calculation
  const stats: UnifiedTeamStats = {
    total: unifiedTeam.length,
    invited: unifiedTeam.filter(m => m.status === 'invited').length,
    active: unifiedTeam.filter(m => m.status === 'active').length,
    inactive: unifiedTeam.filter(m => ['inactive', 'expired', 'cancelled'].includes(m.status)).length,
  };

  // Helper to get partner type label
  const getPartnerTypeLabel = () => {
    if (currentProfessional?.professional_type === 'mortgage_professional') {
      return 'Realtor';
    }
    return 'Mortgage Professional';
  };

  return {
    unifiedTeam,
    isLoading,
    error,
    stats,
    currentProfessional,
    getPartnerTypeLabel,
    refetch,
    deleteInvitation: deleteInvitationMutation.mutateAsync,
    cancelInvitation: cancelInvitationMutation.mutateAsync,
    removeTeamMember: removeTeamMemberMutation.mutateAsync,
    isDeleting: deleteInvitationMutation.isPending,
    isCancelling: cancelInvitationMutation.isPending,
    isRemoving: removeTeamMemberMutation.isPending,
  };
}
