import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
interface UnifiedContact {
  id: string;
  contact_type: 'professional' | 'client' | 'manual';
  full_name: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  professional_type?: string;
  status: string;
  relationship_type: 
    | 'team_member' 
    | 'client' 
    | 'realtor_partner' 
    | 'lending_team' 
    | 'attorney' 
    | 'title_company' 
    | 'inspector' 
    | 'appraiser' 
    | 'insurance' 
    | 'contractor' 
    | 'other';
  related_to_professional_id?: string;
  relationship_id?: string;  // Important: Used for professional_teams deletion
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
  contactType?: 'all' | 'professional' | 'client' | 'manual';
  relationshipType?: 'all' | 'team_member' | 'client' | 'realtor_partner' | 'lending_team' | 'attorney' | 'title_company' | 'inspector' | 'appraiser' | 'insurance' | 'contractor' | 'other';
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UnifiedContact[];
    },
    enabled: !!userContext
  });

  // Derived data - categorized contacts
  const teamMembers = allContacts.filter(c => c.relationship_type === 'team_member');
  const clients = allContacts.filter(c => c.relationship_type === 'client');
  const realtorPartners = allContacts.filter(c => 
    c.relationship_type === 'realtor_partner' || 
    (c.relationship_type === 'team_member' && c.professional_type === 'realtor')
  );
  const lendingTeam = allContacts.filter(c => 
    c.relationship_type === 'lending_team' ||
    (c.relationship_type === 'team_member' && c.professional_type === 'mortgage_professional')
  );
  const vendors = allContacts.filter(c => 
    ['attorney', 'title_company', 'inspector', 'appraiser', 'insurance', 'contractor', 'other'].includes(c.relationship_type)
  );
  // Legacy: partners combines team_members and realtor_partners for backward compatibility
  const partners = allContacts.filter(c => 
    c.contact_type === 'professional' || c.contact_type === 'manual'
  );

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
      
      const insertData = isCurrentUserMortgage 
        ? {
            mortgage_professional_id: userContext.professionalId,
            realtor_id: professionalId,
            status: 'active',
            notes
          }
        : {
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['unified-team'] });
      queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
      queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
      queryClient.invalidateQueries({ queryKey: ['mortgage-team-stats'] });
      toast.success('Professional added to your team');
    },
    onError: (error: Error) => {
      console.error('Add professional error:', error);
      toast.error('Failed to add professional', {
        description: error.message
      });
    }
  });

  // Update visibility settings for a team member
  const updateVisibility = useMutation({
    mutationFn: async ({
      professionalId,
      settings
    }: {
      professionalId: string;
      settings: { visible_to_clients: boolean };
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
      professionalId,
      role
    }: {
      clientId: string;
      professionalId: string;
      role?: string;
    }) => {
      if (!userContext) throw new Error('User context not loaded');

      const { data, error } = await supabase
        .from('client_team_assignments')
        .insert({
          client_id: clientId,
          professional_id: professionalId,
          assigned_by: userContext.professionalId,
          professional_role: role || 'team_member',
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

  // Add client manually
  const addClientManually = useMutation({
    mutationFn: async (clientData: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      notes?: string;
    }) => {
      if (!userContext) throw new Error('User context not loaded');

      const { data, error } = await supabase
        .from('client_profiles')
        .insert({
          professional_id: userContext.professionalId,
          first_name: clientData.firstName,
          last_name: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone,
          notes: clientData.notes,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast.success('Client added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add client');
    }
  });

  // Search available professionals (not yet in network)
  const searchAvailableProfessionals = async (query: string, professionalType?: string) => {
    if (!userContext) return [];
    
    let queryBuilder = supabase
      .from('professionals')
      .select('id, user_id, name, company, professional_type, phone, email')
      .neq('user_id', userContext.userId)
      .eq('status', 'active');

    if (professionalType) {
      queryBuilder = queryBuilder.eq('professional_type', professionalType);
    }

    if (query.trim()) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder.limit(20);
    
    if (error) throw error;
    
    // Filter out professionals already in network
    const existingIds = new Set(allContacts.map(c => c.id));
    return (data || []).filter(p => !existingIds.has(p.id));
  };

  // Add team member (for internal team members)
  const addTeamMember = useMutation({
    mutationFn: async ({ professionalId, role, notes }: { 
      professionalId: string; 
      role?: 'assistant' | 'coordinator' | 'loan_officer' | 'manager' | 'processor' | 'underwriter';
      notes?: string;
    }) => {
      if (!userContext) throw new Error('User context not loaded');

      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          team_owner_id: userContext.userId,
          team_member_id: professionalId,
          role: role || 'loan_officer',
          notes,
          status: 'active',
          added_by: userContext.userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast.success('Team member added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add team member', {
        description: error.message
      });
    }
  });

  // Add manual contact (for attorneys, title companies, etc.)
  const addManualContact = useMutation({
    mutationFn: async (contact: {
      firstName: string;
      lastName?: string;
      email?: string;
      phone?: string;
      companyName?: string;
      professionalType: string;
      roleTitle?: string;
      notes?: string;
      visibleToClients?: boolean;
    }) => {
      if (!userContext) throw new Error('User context not loaded');

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          owner_id: userContext.professionalId,
          first_name: contact.firstName,
          last_name: contact.lastName || '',
          email: contact.email,
          phone: contact.phone,
          company_name: contact.companyName,
          professional_type: contact.professionalType,
          role_title: contact.roleTitle,
          notes: contact.notes,
          visible_to_clients: contact.visibleToClients ?? true,
          requires_system_access: false,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['manual-contacts'] });
      toast.success('Contact added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add contact', {
        description: error.message
      });
    }
  });

  // Update manual contact
  const updateManualContact = useMutation({
    mutationFn: async (contact: {
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      companyName?: string;
      professionalType?: string;
      roleTitle?: string;
      notes?: string;
      visibleToClients?: boolean;
    }) => {
      const { id, ...updates } = contact;
      
      const { data, error } = await supabase
        .from('contacts')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
          phone: updates.phone,
          company_name: updates.companyName,
          professional_type: updates.professionalType,
          role_title: updates.roleTitle,
          notes: updates.notes,
          visible_to_clients: updates.visibleToClients,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['manual-contacts'] });
      toast.success('Contact updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update contact', {
        description: error.message
      });
    }
  });

  // ============================================================
  // FIXED: Unified contact removal - handles all contact types
  // ============================================================
  const removeContact = useMutation({
    mutationFn: async (contact: UnifiedContact) => {
      if (!userContext) throw new Error('User context not loaded');

      console.log('Removing contact:', {
        id: contact.id,
        contact_type: contact.contact_type,
        relationship_type: contact.relationship_type,
        relationship_id: contact.relationship_id,
        professional_type: contact.professional_type
      });

      // Case 1: Professional team member from professional_teams table
      // These have a relationship_id that references the professional_teams record
      if (contact.relationship_id && contact.relationship_type === 'team_member') {
        console.log('Removing via professional_teams using relationship_id:', contact.relationship_id);
        
        const { error } = await supabase
          .from('professional_teams')
          .update({ status: 'inactive' })
          .eq('id', contact.relationship_id);

        if (error) {
          console.error('Error removing from professional_teams:', error);
          throw error;
        }
        return;
      }

      // Case 2: Client from client_profiles
      if (contact.contact_type === 'client' || contact.relationship_type === 'client') {
        console.log('Removing client from client_profiles:', contact.id);
        
        const { error } = await supabase
          .from('client_profiles')
          .update({ status: 'inactive' })
          .eq('id', contact.id);

        if (error) {
          console.error('Error removing from client_profiles:', error);
          throw error;
        }
        return;
      }

      // Case 3: Manual contact from contacts table
      // This includes attorneys, title companies, inspectors, etc.
      // These have contact_type === 'manual' and no relationship_id
      if (contact.contact_type === 'manual' || !contact.relationship_id) {
        console.log('Removing manual contact from contacts table:', contact.id);
        
        const { error } = await supabase
          .from('contacts')
          .update({ status: 'inactive' })
          .eq('id', contact.id);

        if (error) {
          console.error('Error removing from contacts:', error);
          throw error;
        }
        return;
      }

      // Case 4: Fallback - try contacts table
      console.log('Fallback: Removing from contacts table:', contact.id);
      
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'inactive' })
        .eq('id', contact.id);

      if (error) {
        console.error('Error in fallback removal:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['manual-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['mortgage-realtor-partners'] });
      queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
      queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
      toast.success('Contact removed from your network');
    },
    onError: (error: Error) => {
      console.error('removeContact mutation error:', error);
      toast.error('Failed to remove contact', {
        description: error.message
      });
    }
  });

  // Remove manual contact (legacy - keeping for backward compatibility)
  const removeManualContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'inactive' })
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['manual-contacts'] });
      toast.success('Contact removed from your network');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove contact', {
        description: error.message
      });
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
      totalVendors: vendors.length,
      totalRealtorPartners: realtorPartners.length,
      totalLendingTeam: lendingTeam.length,
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
    vendors,
    realtorPartners,
    lendingTeam,
    isLoading: isLoadingContext || isLoadingContacts,
    
    // Search
    searchContacts,
    searchAvailableProfessionals,
    
    // Actions
    addExistingProfessional: addExistingProfessional.mutateAsync,
    isAddingProfessional: addExistingProfessional.isPending,
    
    addClientManually: addClientManually.mutateAsync,
    isAddingClient: addClientManually.isPending,
    
    updateVisibility: updateVisibility.mutateAsync,
    isUpdatingVisibility: updateVisibility.isPending,
    
    assignTeamMember: assignTeamMember.mutateAsync,
    isAssigningTeamMember: assignTeamMember.isPending,
    
    removeTeamAssignment: removeTeamAssignment.mutateAsync,
    isRemovingTeamAssignment: removeTeamAssignment.isPending,
    
    addTeamMember: addTeamMember.mutateAsync,
    isAddingTeamMember: addTeamMember.isPending,
    
    // Manual contacts
    addManualContact: addManualContact.mutateAsync,
    isAddingManualContact: addManualContact.isPending,
    updateManualContact: updateManualContact.mutateAsync,
    isUpdatingManualContact: updateManualContact.isPending,
    removeManualContact: removeManualContact.mutateAsync,
    isRemovingManualContact: removeManualContact.isPending,
    
    // Unified contact removal
    removeContact: removeContact.mutateAsync,
    isRemovingContact: removeContact.isPending,
    
    // Analytics
    getCollaborationMetrics
  };
}
