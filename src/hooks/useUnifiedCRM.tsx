import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
interface UnifiedContact {
  id: string;
  contact_type: 'professional' | 'client';
  full_name: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  professional_type?: string;
  status: string;
  relationship_type: 'team_member' | 'client';
  related_to_professional_id?: string;
  visibility_settings?: any;
  created_at: string;
  updated_at: string;
  notes?: string;
}

interface UserContext {
  userId: string;
  professionalId: string;
  professionalType: 'mortgage_professional' | 'realtor';
}

interface SearchFilters {
  contactType?: 'all' | 'professional' | 'client';
  relationshipType?: 'all' | 'team_member' | 'client';
  status?: string;
  professionalType?: string;
}

export function useUnifiedCRM() {
  const queryClient = useQueryClient();

  // Get user context
  const { data: userContext, isLoading: isLoadingContext } = useQuery<UserContext>({
    queryKey: ['user-context'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: professional } = await supabase
        .from('professionals')
        .select('id, professional_type')
        .eq('user_id', user.id)
        .single();

      if (!professional) throw new Error('Professional profile not found');

      return {
        userId: user.id,
        professionalId: professional.id,
        professionalType: professional.professional_type as 'mortgage_professional' | 'realtor'
      };
    }
  });

  // Fetch all contacts from unified view
  const { data: allContacts = [], isLoading: isLoadingContacts } = useQuery<UnifiedContact[]>({
    queryKey: ['crm-contacts', userContext?.professionalId],
    queryFn: async () => {
      if (!userContext) return [];

      const { data, error } = await supabase
        .from('crm_contacts_view')
        .select('*')
        .eq('related_to_professional_id', userContext.professionalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UnifiedContact[];
    },
    enabled: !!userContext
  });

  // Derived data - categorized contacts
  const teamMembers = allContacts.filter(c => c.relationship_type === 'team_member');
  const clients = allContacts.filter(c => c.relationship_type === 'client');
  const partners = teamMembers.filter(c => c.contact_type === 'professional');

  // Search function
  const searchContacts = (query: string, filters: SearchFilters = {}) => {
    let results = [...allContacts];

    // Apply contact type filter
    if (filters.contactType && filters.contactType !== 'all') {
      results = results.filter(c => c.contact_type === filters.contactType);
    }

    // Apply relationship type filter
    if (filters.relationshipType && filters.relationshipType !== 'all') {
      results = results.filter(c => c.relationship_type === filters.relationshipType);
    }

    // Apply status filter
    if (filters.status) {
      results = results.filter(c => c.status === filters.status);
    }

    // Apply professional type filter
    if (filters.professionalType) {
      results = results.filter(c => c.professional_type === filters.professionalType);
    }

    // Text search
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      results = results.filter(c => 
        c.full_name.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.phone?.includes(query) ||
        c.company?.toLowerCase().includes(searchLower)
      );
    }

    return results;
  };

  // Add existing professional to team
  const addExistingProfessional = useMutation({
    mutationFn: async ({ professionalId, notes }: { professionalId: string; notes?: string }) => {
      if (!userContext) throw new Error('User context not loaded');

      // Determine the relationship direction
      const isCurrentUserMortgage = userContext.professionalType === 'mortgage_professional';
      
      const insertData = isCurrentUserMortgage ? {
        mortgage_professional_id: userContext.professionalId,
        realtor_id: professionalId,
        status: 'active',
        notes
      } : {
        mortgage_professional_id: professionalId,
        realtor_id: userContext.professionalId,
        status: 'active',
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
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['mortgage-realtor-partners'] });
      toast.success('Professional added to your team');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add professional');
    }
  });

  // Update visibility settings
  const updateVisibility = useMutation({
    mutationFn: async ({ 
      professionalId, 
      settings 
    }: { 
      professionalId: string; 
      settings: any 
    }) => {
      const { error } = await supabase
        .from('professionals')
        .update({ visibility_settings: settings })
        .eq('id', professionalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast.success('Visibility settings updated');
    },
    onError: () => {
      toast.error('Failed to update visibility settings');
    }
  });

  // Assign team member to client
  const assignTeamMember = useMutation({
    mutationFn: async ({
      clientId,
      memberId,
      role
    }: {
      clientId: string;
      memberId: string;
      role: string;
    }) => {
      if (!userContext) throw new Error('User context not loaded');

      const { data, error } = await supabase
        .from('client_team_assignments')
        .insert({
          client_id: clientId,
          professional_id: memberId,
          professional_role: role,
          assigned_by: userContext.professionalId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['client-team-assignments'] });
      toast.success('Team member assigned to client');
    },
    onError: () => {
      toast.error('Failed to assign team member');
    }
  });

  // Remove team member from client
  const removeTeamAssignment = useMutation({
    mutationFn: async ({
      clientId,
      professionalId
    }: {
      clientId: string;
      professionalId: string;
    }) => {
      const { error } = await supabase
        .from('client_team_assignments')
        .update({ status: 'inactive' })
        .eq('client_id', clientId)
        .eq('professional_id', professionalId)
        .eq('status', 'active');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['client-team-assignments'] });
      toast.success('Team member unassigned');
    },
    onError: () => {
      toast.error('Failed to unassign team member');
    }
  });

  // Analytics
  const getCollaborationMetrics = () => {
    const totalTeamMembers = teamMembers.length;
    const totalClients = clients.length;
    
    return {
      totalTeamMembers,
      totalClients,
      totalPartners: partners.length,
      collaborationRate: 0 // Placeholder - would need client_team_assignments query
    };
  };

  return {
    // Context
    userContext,
    
    // Data
    allContacts,
    teamMembers,
    clients,
    partners,
    isLoading: isLoadingContext || isLoadingContacts,
    
    // Search
    searchContacts,
    
    // Actions
    addExistingProfessional: addExistingProfessional.mutateAsync,
    isAddingProfessional: addExistingProfessional.isPending,
    
    updateVisibility: updateVisibility.mutateAsync,
    isUpdatingVisibility: updateVisibility.isPending,
    
    assignTeamMember: assignTeamMember.mutateAsync,
    isAssigningTeamMember: assignTeamMember.isPending,
    
    removeTeamAssignment: removeTeamAssignment.mutateAsync,
    isRemovingTeamAssignment: removeTeamAssignment.isPending,
    
    // Analytics
    getCollaborationMetrics
  };
}
