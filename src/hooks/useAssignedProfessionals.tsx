
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Define the return type for the client_profiles query
        interface ClientProfileResult {
          professional_id: string | null;
        }

        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle<ClientProfileResult>();

        if (!clientProfile?.professional_id) {
          return [];
        }

        const { data: professionals } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', clientProfile.professional_id);

        return professionals as Professional[] || [];
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
