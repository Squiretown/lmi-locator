import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getValidSession } from '@/lib/auth/getValidSession';

interface LendingTeamMember {
  id: string;
  team_leader_id: string;
  team_member_id: string;
  role: string;
  permissions: any;
  status: string;
  invited_at: string;
  joined_at: string | null;
  professional: {
    id: string;
    name: string;
    company: string;
    phone: string | null;
    user_id: string;
  };
}

interface LendingTeamInvitation {
  professional_email: string;
  role: string;
  permissions?: any;
  custom_message?: string;
}

export function useLendingTeamManagement() {
  const queryClient = useQueryClient();

  // Get current professional ID
  const { data: currentProfessional } = useQuery({
    queryKey: ['current-professional'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .eq('professional_type', 'mortgage_professional')
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch lending team members
  const { data: lendingTeamMembers = [], isLoading: isLoadingTeam } = useQuery({
    queryKey: ['lending-team-members', currentProfessional?.id],
    queryFn: async () => {
      if (!currentProfessional?.id) return [];

      const { data, error } = await supabase
        .from('lending_teams')
        .select(`
          *,
          professional:professionals!lending_teams_team_member_id_fkey(
            id,
            name,
            company,
            phone,
            user_id
          )
        `)
        .eq('team_leader_id', currentProfessional.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!currentProfessional?.id,
  });

  // Available mortgage professionals to add to team
  const { data: availableProfessionals = [], isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['available-mortgage-professionals', currentProfessional?.id],
    queryFn: async () => {
      if (!currentProfessional?.id) return [];

      // Get professionals not already on the team
      const teamMemberIds = lendingTeamMembers.map(member => member.team_member_id);
      
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, company, phone, user_id')
        .eq('professional_type', 'mortgage_professional')
        .eq('status', 'active')
        .neq('id', currentProfessional.id)
        .not('id', 'in', `(${teamMemberIds.join(',') || 'null'})`)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!currentProfessional?.id && lendingTeamMembers !== undefined,
  });

  // Invite lending team member
  const inviteTeamMemberMutation = useMutation({
    mutationFn: async (invitation: LendingTeamInvitation) => {
      // Get fresh session to avoid stale JWT tokens
      await getValidSession();

      // Supabase SDK automatically uses the fresh token
      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: invitation.professional_email,
          userType: 'mortgage_professional',
          sendVia: 'email',
          customMessage: invitation.custom_message
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Team member invitation sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['lending-team-members'] });
    },
    onError: (error: any) => {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation. Please try again.');
    },
  });

  // Add existing professional to team
  const addTeamMemberMutation = useMutation({
    mutationFn: async ({ professionalId, role, permissions }: { 
      professionalId: string; 
      role: string; 
      permissions?: any; 
    }) => {
      if (!currentProfessional?.id) throw new Error('No current professional');

      const { data, error } = await supabase
        .from('lending_teams')
        .insert({
          team_leader_id: currentProfessional.id,
          team_member_id: professionalId,
          role,
          permissions: permissions || { can_view_clients: true, can_edit_clients: false },
          status: 'active',
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Team member added successfully!');
      queryClient.invalidateQueries({ queryKey: ['lending-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['available-mortgage-professionals'] });
    },
    onError: (error: any) => {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member. Please try again.');
    },
  });

  // Remove team member
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (teamMemberId: string) => {
      const { error } = await supabase
        .from('lending_teams')
        .update({ status: 'inactive' })
        .eq('id', teamMemberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Team member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['lending-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['available-mortgage-professionals'] });
    },
    onError: (error: any) => {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member. Please try again.');
    },
  });

  // Update team member role/permissions
  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ teamMemberId, role, permissions }: { 
      teamMemberId: string; 
      role?: string; 
      permissions?: any; 
    }) => {
      const updates: any = {};
      if (role) updates.role = role;
      if (permissions) updates.permissions = permissions;

      const { error } = await supabase
        .from('lending_teams')
        .update(updates)
        .eq('id', teamMemberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Team member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['lending-team-members'] });
    },
    onError: (error: any) => {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member. Please try again.');
    },
  });

  return {
    lendingTeamMembers,
    availableProfessionals,
    isLoadingTeam,
    isLoadingAvailable,
    inviteTeamMember: inviteTeamMemberMutation.mutate,
    addTeamMember: addTeamMemberMutation.mutate,
    removeTeamMember: removeTeamMemberMutation.mutate,
    updateTeamMember: updateTeamMemberMutation.mutate,
    isInviting: inviteTeamMemberMutation.isPending,
    isAdding: addTeamMemberMutation.isPending,
    isRemoving: removeTeamMemberMutation.isPending,
    isUpdating: updateTeamMemberMutation.isPending,
  };
}