
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LendingTeamMember {
  id: string;
  name: string;
  company: string;
  phone?: string;
  user_id: string;
  professional_type: string;
  status: string;
  created_at: string;
  isAccountOwner?: boolean;
  visibility_settings?: {
    visible_to_clients: boolean;
    showcase_role?: string;
    showcase_description?: string;
  };
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
    visibility_settings?: any;
  };
}

export const useMortgageTeamManagement = () => {
  const queryClient = useQueryClient();

  // Fetch lending team members (including current user)
  const { data: lendingTeam = [], isLoading: isLoadingTeam } = useQuery({
    queryKey: ['lending-team'],
    queryFn: async (): Promise<LendingTeamMember[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentProfessional } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .eq('professional_type', 'mortgage_professional')
        .single();

      if (!currentProfessional) return [];

      // Get all mortgage professionals in the same company (including current user)
      const { data: teamMembers, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('professional_type', 'mortgage_professional')
        .eq('company', currentProfessional.company)
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching lending team:', error);
        return [];
      }

      return (teamMembers || []).map(member => ({
        ...member,
        isAccountOwner: member.id === currentProfessional.id,
        visibility_settings: typeof member.visibility_settings === 'object' && member.visibility_settings
          ? member.visibility_settings as any
          : {
              visible_to_clients: true,
              showcase_role: null,
              showcase_description: null
            }
      }));
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
        .eq('professional_type', 'mortgage_professional')
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
              .select('id, name, company, phone, license_number, visibility_settings')
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
          target_professional_role: data.professionalType === 'mortgage_professional' ? 'mortgage_professional' : data.professionalType,
          custom_message: data.customMessage,
          professional_id: currentProfessional.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email via the dedicated professional invitation edge function
      const { error: emailError } = await supabase.functions.invoke('send-professional-invitation', {
        body: {
          email: data.email,
          name: data.name,
          professionalType: data.professionalType,
          customMessage: data.customMessage,
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
      
      // Show specific error messages
      if (error.message?.includes('Professional profile not found')) {
        toast.error('Please complete your professional profile before sending invitations');
      } else if (error.message?.includes('not found')) {
        toast.error('Professional profile missing. Please contact support.');
      } else {
        toast.error(error.message || 'Failed to send invitation');
      }
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

  // Update professional visibility settings
  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ 
      professionalId, 
      settings 
    }: { 
      professionalId: string; 
      settings: any
    }) => {
      const { data, error } = await supabase
        .from('professionals')
        .update({ 
          visibility_settings: settings 
        })
        .eq('id', professionalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lending-team'] });
      queryClient.invalidateQueries({ queryKey: ['realtor-partners'] });
    }
  });

  // Combine all team members for visibility management
  const teamMembers = [
    ...lendingTeam.map(member => ({
      ...member,
      visibility_settings: member.visibility_settings || {
        visible_to_clients: true,
        showcase_role: null,
        showcase_description: null
      }
    })),
    ...realtorPartners.filter(p => p.realtor).map(partner => ({
      id: partner.realtor!.id,
      name: partner.realtor!.name,
      company: partner.realtor!.company,
      phone: partner.realtor!.phone,
      user_id: '',
      professional_type: 'realtor',
      status: partner.status,
      created_at: partner.created_at,
      isAccountOwner: false,
      visibility_settings: (typeof partner.realtor!.visibility_settings === 'object' && partner.realtor!.visibility_settings) ? 
        partner.realtor!.visibility_settings as any : {
        visible_to_clients: true,
        showcase_role: null,
        showcase_description: null
      }
    }))
  ];

  return {
    lendingTeam,
    realtorPartners,
    teamMembers,
    isLoading: isLoadingTeam || isLoadingPartners,
    inviteProfessional: inviteProfessionalMutation.mutateAsync,
    contactProfessional: contactProfessionalMutation.mutateAsync,
    updateProfessionalVisibility: updateVisibilityMutation.mutateAsync,
    isInviting: inviteProfessionalMutation.isPending,
    isContacting: contactProfessionalMutation.isPending,
    isUpdatingVisibility: updateVisibilityMutation.isPending,
  };
};
