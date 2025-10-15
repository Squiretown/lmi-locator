import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtimeTeamUpdates } from './useRealtimeTeamUpdates';
import { getValidSession } from '@/lib/auth/getValidSession';

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
  visibility_settings?: {
    visible_to_clients: boolean;
    showcase_role?: string;
    showcase_description?: string;
  };
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

  // Query explicit internal team members from team_members table
  // CRITICAL FIX: Always include current user as account owner first
  const { data: lendingTeam = [], isLoading: isLoadingLending } = useQuery({
    queryKey: ['lending-team-unified', currentProfessional?.id, currentUser?.id],
    queryFn: async () => {
      if (!currentProfessional?.id || !currentUser?.id) return [];

      console.log('Fetching team members for user:', currentUser.id);

      // STEP 1: Start with current user as account owner (ALWAYS)
      const visibilitySettings = currentProfessional.visibility_settings as any;
      const team: LendingTeamMember[] = [{
        ...currentProfessional,
        source: 'explicit' as const,
        isAccountOwner: true,
        visibility_settings: {
          visible_to_clients: visibilitySettings?.visible_to_clients ?? true,
          showcase_role: visibilitySettings?.showcase_role || currentProfessional.professional_type || 'Loan Officer',
          showcase_description: visibilitySettings?.showcase_description || ''
        }
      }];

      // STEP 2: Fetch team-specific visibility settings
      const { data: visibilityData, error: visError } = await supabase
        .from('team_member_visibility')
        .select('*')
        .eq('team_owner_id', currentUser.id);

      if (visError) {
        console.error('Error fetching visibility settings:', visError);
      }

      // Create visibility lookup map
      const visibilityMap = new Map(
        (visibilityData || []).map(v => [v.professional_id, v])
      );

      // STEP 3: Query team_members table for explicitly added team relationships
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          permissions,
          status,
          added_at,
          team_member_id
        `)
        .eq('team_owner_id', currentUser.id)
        .eq('status', 'active')
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        return team; // Return at least the account owner
      }

      if (!teamMembers || teamMembers.length === 0) {
        console.log('No additional team members found, returning account owner only');
        return team;
      }

      // STEP 4: Get professional details for each team member
      const memberUserIds = teamMembers.map(tm => tm.team_member_id);
      
      const { data: professionals, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .in('user_id', memberUserIds)
        .eq('status', 'active');

      if (profError) {
        console.error('Error fetching professional details:', profError);
        return team; // Return at least the account owner
      }

      // STEP 5: Combine team member data with professional details and custom visibility
      const enrichedTeamMembers = teamMembers.map(tm => {
        const professional = professionals?.find(p => p.user_id === tm.team_member_id);
        if (!professional) return null;

        // Check for custom team-specific visibility settings first
        const customVisibility = visibilityMap.get(professional.id);
        
        return {
          ...professional,
          source: 'explicit' as const,
          isAccountOwner: false,
          team_member_role: tm.role,
          permissions: tm.permissions,
          visibility_settings: customVisibility ? {
            visible_to_clients: customVisibility.visible_to_clients,
            showcase_role: customVisibility.showcase_role || professional.professional_type,
            showcase_description: customVisibility.showcase_description || ''
          } : {
            // Fallback to professional's own settings or defaults
            visible_to_clients: (professional.visibility_settings as any)?.visible_to_clients ?? true,
            showcase_role: (professional.visibility_settings as any)?.showcase_role || professional.professional_type,
            showcase_description: (professional.visibility_settings as any)?.showcase_description || ''
          }
        };
      }).filter(Boolean);

      console.log('Loaded explicit team members:', enrichedTeamMembers.length);
      
      // STEP 6: Return account owner + team members
      return [...team, ...enrichedTeamMembers] as LendingTeamMember[];
    },
    enabled: !!currentProfessional?.id && !!currentUser?.id,
  });

  // Fetch realtor partners from professional_teams
  const { data: realtorPartners = [], isLoading: isLoadingRealtors, refetch: refetchRealtorPartners } = useQuery({
    queryKey: ['realtor-partners-unified', currentProfessional?.id, currentUser?.id],
    queryFn: async () => {
      if (!currentProfessional?.id || !currentUser?.id) {
        console.log('❌ No current professional ID for realtor partners query');
        return [];
      }

      console.log('🔍 Fetching realtor partners for professional:', currentProfessional.id);

      // Fetch team-specific visibility settings
      const { data: visibilityData, error: visError } = await supabase
        .from('team_member_visibility')
        .select('*')
        .eq('team_owner_id', currentUser.id);

      if (visError) {
        console.error('Error fetching visibility settings:', visError);
      }

      const visibilityMap = new Map(
        (visibilityData || []).map(v => [v.professional_id, v])
      );

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

      // Combine team and realtor data with custom visibility
      const result = teamData.map(team => {
        const realtor = realtorsData?.find(r => r.id === team.realtor_id);
        if (!realtor) {
          console.warn('⚠️ No realtor found for ID:', team.realtor_id);
          return null;
        }
        
        const customVisibility = visibilityMap.get(realtor.id);
        
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
          source: 'explicit' as const,
          visibility_settings: customVisibility ? {
            visible_to_clients: customVisibility.visible_to_clients,
            showcase_role: customVisibility.showcase_role,
            showcase_description: customVisibility.showcase_description
          } : undefined
        };
      }).filter(Boolean) as RealtorPartner[];

      console.log('🎉 Final realtor partners result:', result);
      return result;
    },
    enabled: !!currentProfessional?.id && !!currentUser?.id,
    staleTime: 0, // Always refetch to ensure fresh data
    retry: 3,
  });

  // Enhanced invitation system for both company and explicit teams
  const inviteProfessionalMutation = useMutation({
    mutationFn: async ({ email, role, message, permissions, professionalType }: TeamInvitation) => {
      // Get fresh session to avoid stale JWT tokens
      await getValidSession();

      // Create proper payload structure matching edge function expectations  
      const invitationPayload = {
        email: email.trim().toLowerCase(),
        userType: professionalType || 'realtor',
        firstName: email.split('@')[0], // Extract from email since no name provided
        lastName: '',
        phone: '',
        sendVia: 'email' as const,
        customMessage: message || '',
        // Professional-specific fields
        professionalType: professionalType || 'realtor' as const,
        requiresApproval: false
      };

      console.log('Sending invitation with payload:', invitationPayload);

      // Supabase SDK automatically uses the fresh token
      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: invitationPayload
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
      if (!currentUser?.id) throw new Error('User not authenticated');

      // Check if this is the user's own profile
      const isOwnProfile = currentProfessional?.id === professionalId;
      
      if (isOwnProfile) {
        // Update own professional profile directly
        const { data, error } = await supabase
          .from('professionals')
          .update({ visibility_settings: visibilitySettings })
          .eq('id', professionalId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Use upsert for team member visibility
        const { data, error } = await supabase
          .from('team_member_visibility')
          .upsert({
            team_owner_id: currentUser.id,
            professional_id: professionalId,
            visible_to_clients: visibilitySettings.visible_to_clients,
            showcase_role: visibilitySettings.showcase_role,
            showcase_description: visibilitySettings.showcase_description,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'team_owner_id,professional_id'
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
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
      visibility_settings: partner.visibility_settings || {
        visible_to_clients: true,
        showcase_role: 'Realtor Partner',
        showcase_description: `Realtor at ${partner.realtor.company}`
      }
    })),
  ];

  // Manual add existing professional mutation (handles both mortgage pros and realtors)
  const addExistingProfessionalMutation = useMutation({
    mutationFn: async ({ professionalId, notes }: { professionalId: string; notes?: string }) => {
      if (!currentProfessional) throw new Error('Professional not loaded');

      // Determine which field should have the current user's ID based on their type
      const insertData = currentProfessional.professional_type === 'mortgage_professional'
        ? {
            mortgage_professional_id: currentProfessional.id,
            realtor_id: professionalId,
            status: 'active' as const,
            notes
          }
        : {
            mortgage_professional_id: professionalId,
            realtor_id: currentProfessional.id,
            status: 'active' as const,
            notes
          };

      const { data, error } = await supabase
        .from('professional_teams')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('This professional is already on your team');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
      queryClient.invalidateQueries({ queryKey: ['mortgage-realtor-partners'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Realtor added to your team');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add realtor');
    }
  });

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
    addExistingProfessional: addExistingProfessionalMutation.mutateAsync,
    
    // Loading states for actions
    isInviting: inviteProfessionalMutation.isPending,
    isContacting: contactProfessionalMutation.isPending,
    isUpdatingVisibility: updateVisibilityMutation.isPending,
    isAddingExisting: addExistingProfessionalMutation.isPending,
  };
}
