import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedInvitation {
  id: string;
  professional_id: string;
  invitation_type: string;
  recipient_email: string;
  recipient_name?: string;
  recipient_phone?: string;
  status: string;
  invitation_code: string;
  created_at: string;
  sent_at?: string;
  accepted_at?: string;
  expires_at?: string;
  custom_message?: string;
  template_type?: string;
  email_sent: boolean;
  sms_sent: boolean;
  target_professional_role?: string;
  team_context?: any;
}

export function useUnifiedInvitationsList() {
  return useQuery<UnifiedInvitation[]>({
    queryKey: ['unified-invitations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // For now, fetch from client_invitations
      const { data, error } = await supabase
        .from('client_invitations')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to unified format
      const unified: UnifiedInvitation[] = (data || []).map(inv => ({
        id: inv.id,
        professional_id: inv.professional_id,
        invitation_type: 'client',
        recipient_email: inv.client_email,
        recipient_name: inv.client_name,
        recipient_phone: inv.client_phone,
        status: inv.status,
        invitation_code: inv.invitation_code,
        created_at: inv.created_at || new Date().toISOString(),
        sent_at: inv.sent_at,
        accepted_at: inv.accepted_at,
        expires_at: inv.expires_at,
        custom_message: inv.custom_message,
        template_type: inv.template_type,
        email_sent: inv.email_sent || false,
        sms_sent: inv.sms_sent || false,
        target_professional_role: inv.target_professional_role,
        team_context: inv.team_context,
      }));

      return unified;
    },
    initialData: [],
  });
}