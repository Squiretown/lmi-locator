import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: string;
  income?: number;
  timeline?: string;
  created_at: string;
  updated_at: string;
  professional_id: string;
}

export const useMortgageClientManagement = () => {
  const queryClient = useQueryClient();

  // Fetch clients for the current mortgage professional
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['mortgage-clients'],
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
    }
  });

  // Create a new client
  const createClientMutation = useMutation({
    mutationFn: async (clientData: Omit<ClientProfile, 'id' | 'created_at' | 'updated_at' | 'professional_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
        .insert({
          ...clientData,
          professional_id: professional.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-clients'] });
    }
  });

  // Update a client
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
      queryClient.invalidateQueries({ queryKey: ['mortgage-clients'] });
    }
  });

  return {
    clients,
    isLoading,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending
  };
};