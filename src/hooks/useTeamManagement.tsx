import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfessionalTeam {
  id: string;
  mortgage_professional_id: string;
  realtor_id: string;
  created_at: string;
  status: string;
  notes?: string;
  realtor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company: string;
    license_number: string;
  };
}

interface ClientTeamAssignment {
  id: string;
  client_id: string;
  professional_id: string;
  professional_role: 'mortgage_professional' | 'realtor';
  assigned_at: string;
  assigned_by?: string;
  status: string;
  professional?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company: string;
    type: string;
  };
}

export const useTeamManagement = () => {
  const queryClient = useQueryClient();

  // Fetch team members (realtors) for current mortgage professional
  const { data: teamMembers = [], isLoading: isLoadingTeam, error: teamError } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      try {
        // Get current user's professional ID first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: currentProfessional } = await supabase
          .from('professionals')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!currentProfessional) {
          console.warn('No professional profile found for current user');
          return [];
        }

        // Fetch professional teams with manual join to handle missing relationships
        const { data: teams, error: teamsError } = await supabase
          .from('professional_teams')
          .select('*')
          .eq('mortgage_professional_id', currentProfessional.id)
          .eq('status', 'active');

        if (teamsError) {
          console.error('Error fetching teams:', teamsError);
          return [];
        }

        if (!teams || teams.length === 0) {
          return [];
        }

        // Manually fetch realtor details for each team
        const teamWithRealtors = await Promise.all(
          teams.map(async (team) => {
            try {
              const { data: realtor } = await supabase
                .from('professionals')
                .select('id, name, phone, company, license_number, user_id')
                .eq('id', team.realtor_id)
                .single();

              return {
                ...team,
                realtor: realtor || null
              };
            } catch (error) {
              console.warn(`Failed to fetch realtor for team ${team.id}:`, error);
              return {
                ...team,
                realtor: null
              };
            }
          })
        );

        return teamWithRealtors;
      } catch (error) {
        console.error('Error in team members query:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch client team assignments
  const { data: clientTeams = [], isLoading: isLoadingClientTeams } = useQuery({
    queryKey: ['client-teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_team_assignments')
        .select(`
          *,
          professional:professionals!client_team_assignments_professional_id_fkey (
            id,
            name,
            phone,
            company,
            type,
            user_id
          )
        `)
        .eq('status', 'active');

      if (error) throw error;
      return data as any[];
    },
  });

  // Get team members for a specific client
  const getClientTeam = (clientId: string) => {
    return clientTeams.filter(assignment => assignment.client_id === clientId);
  };

  // Invite realtor to team
  const inviteRealtorMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      name?: string;
      customMessage?: string;
    }) => {
      const { data: invitation, error } = await supabase
        .from('client_invitations')
        .insert({
          client_email: data.email,
          client_name: data.name,
          invitation_target_type: 'professional',
          target_professional_role: 'realtor',
          custom_message: data.customMessage,
          professional_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-client-invitation', {
        body: {
          invitationId: invitation.id,
          type: 'professional',
        },
      });

      if (emailError) throw emailError;
      return invitation;
    },
    onSuccess: () => {
      toast.success('Realtor invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error: any) => {
      console.error('Error inviting realtor:', error);
      toast.error('Failed to send realtor invitation');
    },
  });

  // Add realtor to team (when they accept invitation)
  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: {
      realtorId: string;
      notes?: string;
    }) => {
      const { data: team, error } = await supabase
        .from('professional_teams')
        .insert({
          realtor_id: data.realtorId,
          notes: data.notes,
          mortgage_professional_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return team;
    },
    onSuccess: () => {
      toast.success('Realtor added to team');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error: any) => {
      console.error('Error adding team member:', error);
      toast.error('Failed to add realtor to team');
    },
  });

  // Assign client to team members
  const assignClientToTeamMutation = useMutation({
    mutationFn: async (data: {
      clientId: string;
      realtorId?: string;
      assignedBy?: string;
    }) => {
      const assignments = [];
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // Always assign mortgage professional
      assignments.push({
        client_id: data.clientId,
        professional_id: userId,
        professional_role: 'mortgage_professional',
        assigned_by: data.assignedBy || userId,
      });

      // Assign realtor if specified
      if (data.realtorId) {
        assignments.push({
          client_id: data.clientId,
          professional_id: data.realtorId,
          professional_role: 'realtor',
          assigned_by: data.assignedBy || userId,
        });
      }

      const { data: result, error } = await supabase
        .from('client_team_assignments')
        .insert(assignments)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Client assigned to team');
      queryClient.invalidateQueries({ queryKey: ['client-teams'] });
    },
    onError: (error: any) => {
      console.error('Error assigning client to team:', error);
      toast.error('Failed to assign client to team');
    },
  });

  // Remove team member
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
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error: any) => {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    },
  });

  return {
    teamMembers,
    clientTeams,
    isLoadingTeam,
    isLoadingClientTeams,
    getClientTeam,
    inviteRealtor: inviteRealtorMutation.mutateAsync,
    addTeamMember: addTeamMemberMutation.mutateAsync,
    assignClientToTeam: assignClientToTeamMutation.mutateAsync,
    removeTeamMember: removeTeamMemberMutation.mutateAsync,
    isInvitingRealtor: inviteRealtorMutation.isPending,
    isAddingMember: addTeamMemberMutation.isPending,
    isAssigningClient: assignClientToTeamMutation.isPending,
    isRemovingMember: removeTeamMemberMutation.isPending,
  };
};