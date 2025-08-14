import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReceivedInvitation {
  id: string;
  professional_id: string;
  client_email: string;
  client_name: string | null;
  target_professional_role: string | null;
  invitation_target_type: string;
  status: string;
  created_at: string;
  expires_at: string;
  custom_message: string | null;
  invitation_code: string;
  professional?: {
    name: string;
    company: string;
    email?: string;
  };
}

export function useReceivedInvitations() {
  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch invitations received by the current user's email
  const { data: receivedInvitations = [], isLoading } = useQuery({
    queryKey: ['received-invitations', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];

      const { data, error } = await supabase
        .from('client_invitations')
        .select(`
          *,
          professionals!client_invitations_professional_id_fkey (
            name,
            company,
            email
          )
        `)
        .eq('client_email', currentUser.email)
        .eq('invitation_target_type', 'professional')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching received invitations:', error);
        return [];
      }

      return data as ReceivedInvitation[];
    },
    enabled: !!currentUser?.email,
  });

  return {
    receivedInvitations,
    isLoading,
  };
}