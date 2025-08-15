import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtimeTeamUpdates } from './useRealtimeTeamUpdates';

// Enhanced data structures for unified team management
interface LendingTeamMember {
  id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  professional_type: string;
  role?: string; // For explicit team relationships
  source: 'company' | 'explicit'; // Track where the relationship comes from
  permissions?: string[];
  isAccountOwner?: boolean;
  visibility_settings: {
    visible_to_clients: boolean;
    showcase_role?: string;
    showcase_description?: string;
  };
}

interface RealtorPartner {
  id: string;
  realtor: {
    id: string;
    name: string;
    company: string;
    email?: string;
    phone?: string;
    license_number?: string;
  };
  role?: string;
  source: 'company' | 'explicit';
}

interface TeamInvitation {
  email: string;
  role: string;
  professionalType?: 'mortgage_professional' | 'realtor'; // Add this to support InviteProfessionalDialog
  message?: string;
  permissions?: string[];
}

interface TeamMemberUnified {
  id: string;
  name: string;
  type: 'mortgage_professional' | 'realtor';
  professional_type: string; // Make this required to match ClientTeamShowcase expectations
  company: string;
  email?: string;
  phone?: string;
  role?: string;
  source: 'company' | 'explicit';
  isAccountOwner?: boolean;
  visibility_settings: {
    visible_to_clients: boolean;
    showcase_role?: string;
    showcase_description?: string;
  };
}

export function useMortgageTeamManagement() {
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get current professional
  const { data: currentProfessional } = useQuery({
    queryKey: ['current-professional'],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching current professional:', error);
        return null;
      }
      return data;
    },
    enabled: !!currentUser?.id,
  });

  // Fetch unified lending team (company-based only for now)
  const { data: lendingTeam = [], isLoading: isLoadingLending } = useQuery({
    queryKey: ['lending-team-unified', currentProfessional?.id],
    queryFn: async () => {
      if (!currentProfessional?.id) return [];

      // Fetch company-based team members
      const { data: companyTeam, error: companyError } = await supabase
        .from('professionals')
        .select('*')
        .eq('professional_type', 'mortgage_professional')
        .eq('company', currentProfessional.company)
        .eq('status', 'active')
        .order('name');

      if (companyError) {
        console.error('Error fetching company team:', companyError);
        return [];
      }

      // For now, just use company-based teams
      return (companyTeam || []).map(member => ({
        ...member,
        source: 'company' as const,
        isAccountOwner: member.id === currentProfessional.id,
        visibility_settings: (typeof member.visibility_settings === 'object' && member.visibility_settings && !Array.isArray(member.visibility_settings)) ? {
          visible_to_clients: (member.visibility_settings as any).visible_to_clients || true,
          showcase_role: (member.visibility_settings as any).showcase_role || member.name,
          showcase_description: (member.visibility_settings as any).showcase_description || `${member.professional_type} at ${member.company}`
        } : {
          visible_to_clients: true,
          showcase_role: member.name,
          showcase_description: `${member.professional_type} at ${member.company}`
        }
      })) as LendingTeamMember[];
    },
    enabled: !!currentProfessional?.id,
  });

  // Fetch realtor partners from professional_teams
  const { data: realtorPartners = [], isLoading: isLoadingRealtors, refetch: refetchRealtorPartners } = useQuery({
    queryKey: ['realtor-partners-unified', currentProfessional?.id],
    queryFn: async () => {
      if (!currentProfessional?.id) {
        console.log('❌ No current professional ID for realtor partners query');
        return [];
      }

      console.log('🔍 Fetching realtor partners for professional:', currentProfessional.id);

      // First get team relationships
      const { data: teamData, error: teamError } = await supabase
        .from('professional_teams')
        .select('id, role, status, realtor_id')
        .eq('mortgage_professional_id', currentProfessional.id)
        .eq('status', 'active');

      console.log('📊 Team data query result:', { teamData, teamError });

      if (teamError) {
        console.error('❌ Error fetching realtor partners:', teamError);
        throw teamError;
      }

      if (!teamData || teamData.length === 0) {
        console.log('⚠️ No team data found for professional:', currentProfessional.id);
        return [];
      }

      // Get realtor details for each team member
      const realtorIds = teamData.map(team => team.realtor_id);
      console.log('🎯 Fetching realtor details for IDs:', realtorIds);

      const { data: realtorsData, error: realtorsError } = await supabase
        .from('professionals')
        .select('id, name, company, email, phone, license_number, status')
        .in('id', realtorIds)
        .eq('status', 'active');

      console.log('👥 Realtors data query result:', { realtorsData, realtorsError });

      if (realtorsError) {
        console.error('❌ Error fetching realtor details:', realtorsError);
        throw realtorsError;
      }

      // Combine team and realtor data
      const result = teamData.map(team => {
        const realtor = realtorsData?.find(r => r.id === team.realtor_id);
        if (!realtor) {
          console.warn('⚠️ No realtor found for ID:', team.realtor_id);
          return null;
        }
        
        console.log('✅ Creating realtor partner:', { team, realtor });
        
        return {
          id: team.id,
          realtor: {
            id: realtor.id,
            name: realtor.name,
            company: realtor.company,
            email: realtor.email,
            phone: realtor.phone,
            license_number: realtor.license_number,
          },
          role: team.role,
          source: 'explicit' as const
        };
      }).filter(Boolean) as RealtorPartner[];

      console.log('🎉 Final realtor partners result:', result);
      return result;
    },
    enabled: !!currentProfessional?.id,
    staleTime: 0, // Always refetch to ensure fresh data
    retry: 3,
  });

  // Enhanced invitation system for both company and explicit teams
  const inviteProfessionalMutation = useMutation({
    mutationFn: async ({ email, role, message, permissions, professionalType }: TeamInvitation) => {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          type: 'professional',
          customMessage: message,
          professionalType: professionalType || 'team_member',
          role
        }
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send invitation');
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Team member invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
    },
    onError: (error: any) => {
      console.error('Team invitation error:', error);
      toast.error(error.message || 'Failed to send team invitation');
    },
  });

  // Contact professional mutation (unchanged)
  const contactProfessionalMutation = useMutation({
    mutationFn: async ({ professionalId, type }: { professionalId: string; type: 'email' | 'sms' }) => {
      // TODO: Implement actual communication logic
      // For now, this is a placeholder that could integrate with email/SMS services
      console.log(`Contacting professional ${professionalId} via ${type}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: `${type} sent successfully` };
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.type === 'email' ? 'Email' : 'SMS'} sent successfully`);
    },
    onError: (error: any) => {
      console.error('Communication error:', error);
      toast.error('Failed to send communication');
    },
  });

  // Update visibility settings
  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ 
      professionalId, 
      visibilitySettings 
    }: { 
      professionalId: string; 
      visibilitySettings: {
        visible_to_clients: boolean;
        showcase_role?: string;
        showcase_description?: string;
      } 
    }) => {
      const { data, error } = await supabase
        .from('professionals')
        .update({ 
          visibility_settings: visibilitySettings
        })
        .eq('id', professionalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Visibility settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
      queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
    },
    onError: (error: any) => {
      console.error('Visibility update error:', error);
      toast.error('Failed to update visibility settings');
    },
  });

  // Combine all team members for unified display
  const teamMembers: TeamMemberUnified[] = [
    ...lendingTeam.map(member => ({
      ...member,
      type: 'mortgage_professional' as const,
    })),
    ...realtorPartners.map(partner => ({
      id: partner.realtor.id,
      name: partner.realtor.name,
      company: partner.realtor.company,
      email: partner.realtor.email,
      phone: partner.realtor.phone,
      type: 'realtor' as const,
      professional_type: 'realtor', // Add required professional_type
      source: partner.source,
      role: partner.role,
      isAccountOwner: false,
      visibility_settings: {
        visible_to_clients: true,
        showcase_role: 'Realtor Partner',
        showcase_description: `Realtor at ${partner.realtor.company}`
      }
    })),
  ];

  // Enable real-time updates
  useRealtimeTeamUpdates(currentProfessional?.id);

  // Also listen for professional_teams changes specifically for immediate updates
  useEffect(() => {
    if (!currentProfessional?.id) return;

    const channel = supabase
      .channel('team-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_teams'
        },
        (payload) => {
          console.log('Professional teams change detected:', payload);
          // Invalidate queries when team relationships change
          queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
          queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfessional?.id, queryClient]);

  return {
    // Data
    lendingTeam,
    realtorPartners,
    teamMembers,
    currentProfessional,
    
    // Loading states
    isLoading: isLoadingLending || isLoadingRealtors,
    
    // Enhanced actions
    inviteProfessional: inviteProfessionalMutation.mutate,
    contactProfessional: contactProfessionalMutation.mutate,
    updateProfessionalVisibility: updateVisibilityMutation.mutate,
    refetchRealtorPartners, // Add manual refresh capability
    
    // Loading states for actions
    isInviting: inviteProfessionalMutation.isPending,
    isContacting: contactProfessionalMutation.isPending,
    isUpdatingVisibility: updateVisibilityMutation.isPending,
  };
}
