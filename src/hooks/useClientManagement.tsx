import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  professional_id: string;
  status: 'active' | 'inactive' | 'lead';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  professional_id: string;
  status: 'active' | 'inactive' | 'lead';
  notes?: string;
  income?: number;
  household_size?: number;
  first_time_buyer?: boolean;
  military_status?: string;
  timeline?: string;
  saved_properties?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  income?: number;
  household_size?: number;
  first_time_buyer?: boolean;
  military_status?: string;
  timeline?: string;
}

export function useClientManagement() {
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  // Fetch client profiles for mortgage professional
  const { data: clients = [], isLoading: isLoadingClients, refetch } = useQuery({
    queryKey: ['client-profiles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the user's professional profile first
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profError || !professional) {
        throw new Error('Professional profile not found. Please complete your profile setup.');
      }

      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientProfile[];
    },
  });

  // Create new client
  const createClientMutation = useMutation({
    mutationFn: async (clientData: CreateClientData & { 
      assignedRealtorId?: string; 
      sendInvitation?: boolean;
      invitationType?: string;
      templateType?: string;
      customMessage?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the user's professional profile first
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profError || !professional) {
        throw new Error('Professional profile not found. Please complete your profile setup.');
      }

      // Create client profile
      const { data: client, error: clientError } = await supabase
        .from('client_profiles')
        .insert({
          professional_id: professional.id,
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          email: clientData.email,
          phone: clientData.phone,
          income: clientData.income,
          household_size: clientData.household_size,
          military_status: clientData.military_status,
          timeline: clientData.timeline,
          first_time_buyer: clientData.first_time_buyer,
          notes: clientData.notes,
          status: 'active'
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Assign client to team (mortgage professional + optional realtor)
      const assignments = [];
      
      // Always assign mortgage professional using professional ID
      assignments.push({
        client_id: client.id,
        professional_id: professional.id,
        professional_role: 'mortgage_professional',
        assigned_by: user.id, // Keep auth user ID for audit purposes
      });

      // Assign realtor if specified
      if (clientData.assignedRealtorId) {
        assignments.push({
          client_id: client.id,
          professional_id: clientData.assignedRealtorId,
          professional_role: 'realtor',
          assigned_by: user.id,
        });
      }

      if (assignments.length > 0) {
        const { error: assignmentError } = await supabase
          .from('client_team_assignments')
          .insert(assignments);

        if (assignmentError) {
          console.error('Failed to assign team members:', assignmentError);
          // Don't throw here - client was created successfully
        }
      }

      // Send invitation if requested
      if (clientData.sendInvitation && clientData.email) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('No active session');

          const { error: inviteError } = await supabase.functions.invoke('send-invitation', {
            body: {
              email: clientData.email,
              type: 'client',
              clientName: `${clientData.first_name} ${clientData.last_name}`,
              clientPhone: clientData.phone,
              invitationType: clientData.invitationType || 'email',
              templateType: clientData.templateType || 'default',
              customMessage: clientData.customMessage
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (inviteError) {
            console.error('Failed to send invitation:', inviteError);
            toast.error('Client created but invitation failed to send');
          } else {
            toast.success('Client created and invitation sent successfully');
          }
        } catch (error) {
          console.error('Error sending invitation:', error);
          toast.error('Client created but invitation failed to send');
        }
      }

      return client;
    },
    onSuccess: () => {
      toast.success('Client created successfully');
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create client: ${error.message}`);
    },
  });

  // Update client
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Client updated successfully');
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update client: ${error.message}`);
    },
  });

  // Delete client
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('client_profiles')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Client deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
      setSelectedClient(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });

  return {
    clients,
    isLoadingClients,
    selectedClient,
    setSelectedClient,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
    refetch,
  };
}