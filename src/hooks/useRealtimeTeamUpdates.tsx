import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeTeamUpdates(professionalId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // CRITICAL: Only subscribe when we have a valid professionalId
    if (!professionalId) {
      console.log('⏸️ Realtime updates: Waiting for professionalId...');
      return;
    }

    console.log('🔄 Setting up realtime subscriptions for professional:', professionalId);

    // Subscribe to professional_teams changes
    const teamsChannel = supabase
      .channel('professional-teams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_teams',
          filter: `mortgage_professional_id=eq.${professionalId}`
        },
        (payload) => {
          console.log('✅ Professional teams change detected:', payload);
          // Invalidate team-related queries
          queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
          queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Teams channel subscription status:', status);
      });

    // Subscribe to client_invitations changes for real-time invitation updates
    const invitationsChannel = supabase
      .channel('client-invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_invitations',
          filter: `professional_id=eq.${professionalId}`
        },
        (payload) => {
          console.log('✅ Client invitations change detected:', payload);
          // Invalidate invitation-related queries
          queryClient.invalidateQueries({ queryKey: ['client-invitations'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Invitations channel subscription status:', status);
      });

    // Subscribe to professionals table changes for team member updates
    const professionalsChannel = supabase
      .channel('professionals-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'professionals'
        },
        (payload) => {
          console.log('✅ Professionals change detected:', payload);
          // Invalidate team queries when professional data changes
          queryClient.invalidateQueries({ queryKey: ['lending-team-unified'] });
          queryClient.invalidateQueries({ queryKey: ['realtor-partners-unified'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Professionals channel subscription status:', status);
      });

    console.log('✅ All realtime subscriptions established');

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🧹 Cleaning up realtime subscriptions');
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(invitationsChannel);
      supabase.removeChannel(professionalsChannel);
    };
  }, [professionalId, queryClient]);
}