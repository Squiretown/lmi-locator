import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/hooks/useAuthContext';

export const useProfessionalInvitations = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current professional ID
  const { data: professional } = useQuery({
    queryKey: ['professional-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch ALL professional invitations
  const { data: allInvitations = [], isLoading } = useQuery({
    queryKey: ['professional-invitations', professional?.id],
    queryFn: async () => {
      if (!professional?.id) return [];

      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('professional_id', professional.id)
        .eq('invitation_target_type', 'professional')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!professional?.id,
  });

  // Filter to only pending/sent invitations (not accepted ones)
  const pendingInvitations = allInvitations.filter(inv => 
    inv.status === 'pending' || inv.status === 'sent'
  );

  // Get accepted invitations separately (these should be shown in realtor partners)
  const acceptedInvitations = allInvitations.filter(inv => inv.status === 'accepted');

  // Get invitation stats
  const stats = {
    total: allInvitations.length,
    pending: allInvitations.filter(inv => inv.status === 'pending').length,
    sent: allInvitations.filter(inv => inv.status === 'sent').length,
    accepted: allInvitations.filter(inv => inv.status === 'accepted').length,
    revoked: allInvitations.filter(inv => inv.status === 'revoked').length,
  };

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) => {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: { invitationId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Invitation Resent",
        description: "Professional invitation has been resent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['professional-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
      });
    },
  });

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-invitation', {
        body: {
          action: 'revoke',
          invitationId,
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Invitation Revoked",
        description: "Professional invitation has been revoked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['professional-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke invitation",
      });
    },
  });

  // Real-time subscription for professional invitations
  useEffect(() => {
    if (!professional?.id) return;

    const channel = supabase
      .channel('professional-invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_invitations',
          filter: `professional_id=eq.${professional.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['professional-invitations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professional?.id, queryClient]);

  return {
    invitations: pendingInvitations, // Only return pending/sent invitations
    allInvitations, // All invitations for stats
    acceptedInvitations, // Accepted invitations for realtor partners
    stats,
    isLoading,
    resendInvitation: resendInvitationMutation.mutate,
    revokeInvitation: revokeInvitationMutation.mutate,
    isResendingInvitation: resendInvitationMutation.isPending,
    isRevokingInvitation: revokeInvitationMutation.isPending,
  };
};