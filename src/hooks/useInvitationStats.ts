import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InvitationStats {
  professional_id: string;
  status: string;
  invitation_count: number;
  email_sent_count: number;
  sms_sent_count: number;
  accepted_count: number;
  expired_count: number;
  avg_days_to_accept: number;
  date_created: string;
}

export function useInvitationStats() {
  return useQuery<InvitationStats[]>({
    queryKey: ['invitation-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // For now, fetch from client_invitations and aggregate
      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('professional_id', user.id);

      if (error) throw error;
      
      // Calculate stats manually
      const stats = data?.reduce((acc, inv) => {
        const status = inv.status;
        if (!acc[status]) {
          acc[status] = {
            professional_id: user.id,
            status,
            invitation_count: 0,
            email_sent_count: 0,
            sms_sent_count: 0,
            accepted_count: 0,
            expired_count: 0,
            avg_days_to_accept: 0,
            date_created: new Date().toISOString().split('T')[0],
          };
        }
        acc[status].invitation_count++;
        if (inv.email_sent) acc[status].email_sent_count++;
        if (inv.sms_sent) acc[status].sms_sent_count++;
        if (inv.accepted_at) acc[status].accepted_count++;
        if (inv.expires_at && new Date(inv.expires_at) < new Date() && inv.status === 'pending') {
          acc[status].expired_count++;
        }
        return acc;
      }, {} as Record<string, InvitationStats>);

      return Object.values(stats || {});
    },
    initialData: [],
  });
}