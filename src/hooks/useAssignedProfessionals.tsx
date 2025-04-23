
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Define a simple type for the client_profiles query result
        type ClientProfileResult = {
          professional_id: string | null;
        };

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

        // Transform the Supabase response to match our Professional interface
        return professionals ? professionals.map(prof => transformProfessional(prof)) : [];
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
