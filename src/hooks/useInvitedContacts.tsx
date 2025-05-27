
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvitedContact {
  id: string;
  email: string;
  name?: string;
  status: 'invited' | 'accepted' | 'registered';
  invited_at: string;
  updated_at: string;
}

export interface InviteContactData {
  email: string;
  name?: string;
}

export function useInvitedContacts() {
  const queryClient = useQueryClient();

  // Fetch invited contacts
  const { data: invitedContacts = [], isLoading } = useQuery({
    queryKey: ['invited-contacts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts_invited')
        .select('*')
        .eq('inviter_id', user.id)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return data as InvitedContact[];
    },
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (inviteData: InviteContactData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts_invited')
        .insert({
          inviter_id: user.id,
          email: inviteData.email,
          name: inviteData.name,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['invited-contacts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  return {
    invitedContacts,
    isLoading,
    createInvitation: createInvitationMutation.mutateAsync,
    isCreatingInvitation: createInvitationMutation.isPending,
  };
}
