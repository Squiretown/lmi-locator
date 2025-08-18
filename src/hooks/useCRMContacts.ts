import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CRMContact {
  id: string;
  user_id?: string;
  contact_type: 'professional' | 'client';
  full_name: string;
  first_name: string;
  last_name?: string;
  professional_id?: string;
  phone?: string;
  email?: string;
  company?: string;
  professional_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export function useCRMContacts() {
  return useQuery<CRMContact[]>({
    queryKey: ['crm-contacts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch from existing client_profiles table for now
      const { data: clients, error: clientError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('professional_id', user.id)
        .eq('status', 'active');

      if (clientError) throw clientError;

      // Transform to CRMContact format
      const contacts: CRMContact[] = (clients || []).map(client => ({
        id: client.id,
        user_id: undefined,
        contact_type: 'client' as const,
        full_name: `${client.first_name} ${client.last_name}`,
        first_name: client.first_name,
        last_name: client.last_name,
        professional_id: client.professional_id,
        phone: client.phone,
        email: client.email,
        company: undefined,
        professional_type: undefined,
        status: client.status,
        created_at: client.created_at || new Date().toISOString(),
        updated_at: client.updated_at || new Date().toISOString(),
        notes: client.notes,
      }));

      return contacts;
    },
    initialData: [],
  });
}