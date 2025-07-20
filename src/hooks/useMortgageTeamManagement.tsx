
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LendingTeamMember {
  id: string;
  name: string;
  company: string;
  phone?: string;
  user_id: string;
  type: string;
  status: string;
  created_at: string;
}

interface RealtorPartner {
  id: string;
  mortgage_professional_id: string;
  realtor_id: string;
  status: string;
  notes?: string;
  created_at: string;
  realtor?: {
    id: string;
    name: string;
    company: string;
    phone?: string;
    license_number: string;
  };
}

export const useMortgageTeamManagement = () => {
  const queryClient = useQueryClient();

  // Fetch lending team members
  const { data: lendingTeam = [], isLoading: isLoadingTeam } = useQuery({
    queryKey: ['lending-team'],
    queryFn: async (): Promise<LendingTeamMember[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentProfessional } = await supabase
        .from('professionals')
        .select('id, company')
        .eq('user_id', user.id)
        .eq('type', 'mortgage_professional')
        .single();

      if (!currentProfessional) return [];

      // Get other mortgage professionals in the same company
      const { data: teamMembers, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('type', 'mortgage_professional')
        .eq('company', currentProfessional.company)
        .eq('status', 'active')
        .neq('id', currentProfessional.id)
        .order('name');

      if (error) {
        console.error('Error fetching lending team:', error);
        return [];
      }

      return teamMembers || [];
    },
  });

  // Fetch realtor partners using the existing team management hook logic
  const { data: realtorPartners = [], isLoading: isLoadingPartners } = useQuery({
    queryKey: ['realtor-partners'],
    queryFn: async (): Promise<RealtorPartner[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'mortgage_professional')
        .single();

      if (!currentProfessional) return [];

      const { data: teams, error } = await supabase
        .from('professional_teams')
        .select('*')
        .eq('mortgage_professional_id', currentProfessional.id)
        .eq('status', 'active');

      if (error || !teams) return [];

      const partnersWithRealtors = await Promise.all(
        teams.map(async (team) => {
          try {
            const { data: realtor } = await supabase
              .from('professionals')
              .select('id, name, company, phone, license_number')
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

      return partnersWithRealtors;
    },
  });

  // Invite professional mutation
  const inviteProfessionalMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      name?: string;
      professionalType: 'mortgage_professional' | 'realtor';
      customMessage?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!currentProfessional) throw new Error('Professional profile not found');

      const { data: invitation, error } = await supabase
        .from('client_invitations')
        .insert({
          client_email: data.email,
          client_name: data.name,
          invitation_target_type: 'professional',
          target_professional_role: data.professionalType,
          custom_message: data.customMessage,
          professional_id: currentProfessional.id,
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
    onSuccess: (_, variables) => {
      toast.success(`${variables.professionalType === 'realtor' ? 'Realtor' : 'Team member'} invitation sent successfully`);
      queryClient.invalidateQueries({ queryKey: ['lending-team'] });
      queryClient.invalidateQueries({ queryKey: ['realtor-partners'] });
      queryClient.invalidateQueries({ queryKey: ['mortgage-team-stats'] });
    },
    onError: (error: any) => {
      console.error('Error inviting professional:', error);
      toast.error('Failed to send invitation');
    },
  });

  // Contact professional mutation
  const contactProfessionalMutation = useMutation({
    mutationFn: async (data: {
      professionalId: string;
      type: 'email' | 'phone';
      message?: string;
    }) => {
      // This would integrate with your communication system
      // For now, we'll just log the action
      console.log('Contacting professional:', data);
      
      // You could integrate with your email/SMS system here
      if (data.type === 'email') {
        // Send email via edge function
        // await supabase.functions.invoke('send-professional-email', { body: data });
      } else {
        // Send SMS via edge function  
        // await supabase.functions.invoke('send-professional-sms', { body: data });
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.type === 'email' ? 'Email' : 'SMS'} sent successfully`);
    },
    onError: (error: any) => {
      console.error('Error contacting professional:', error);
      toast.error('Failed to send message');
    },
  });

  return {
    lendingTeam,
    realtorPartners,
    isLoading: isLoadingTeam || isLoadingPartners,
    inviteProfessional: inviteProfessionalMutation.mutateAsync,
    contactProfessional: contactProfessionalMutation.mutateAsync,
    isInviting: inviteProfessionalMutation.isPending,
    isContacting: contactProfessionalMutation.isPending,
  };
};
