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
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['client-profiles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientProfile[];
    },
  });

  // Create new client
  const createClientMutation = useMutation({
    mutationFn: async (clientData: CreateClientData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('client_profiles')
        .insert({
          professional_id: user.id,
          ...clientData,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
  };
}