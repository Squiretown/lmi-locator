import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConnectTeamMemberParams {
  realtorId: string;
  role?: string;
}

export function useManualTeamConnection() {
  const queryClient = useQueryClient();

  const connectTeamMemberMutation = useMutation({
    mutationFn: async ({ realtorId, role = 'partner' }: ConnectTeamMemberParams) => {
      // Get current professional
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: currentProfessional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .eq('professional_type', 'mortgage_professional')
        .single();

      if (profError || !currentProfessional) {
        throw new Error('Current professional not found');
      }

      // Check if relationship already exists
      const { data: existingRelation } = await supabase
        .from('professional_teams')
        .select('id')
        .eq('mortgage_professional_id', currentProfessional.id)
        .eq('realtor_id', realtorId)
        .single();

      if (existingRelation) {
        throw new Error('Team relationship already exists');
      }

      // Create the team relationship
      const { data, error } = await supabase
        .from('professional_teams')
        .insert({
          mortgage_professional_id: currentProfessional.id,
          realtor_id: realtorId,
          role,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Team member connected successfully');
      queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
      queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
    },
    onError: (error: any) => {
      console.error('Team connection error:', error);
      toast.error(error.message || 'Failed to connect team member');
    },
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('professional_teams')
        .update({ status: 'inactive' })
        .eq('id', teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Team member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
      queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
    },
    onError: (error: any) => {
      console.error('Team removal error:', error);
      toast.error(error.message || 'Failed to remove team member');
    },
  });

  return {
    connectTeamMember: connectTeamMemberMutation.mutate,
    removeTeamMember: removeTeamMemberMutation.mutate,
    isConnecting: connectTeamMemberMutation.isPending,
    isRemoving: removeTeamMemberMutation.isPending,
  };
}