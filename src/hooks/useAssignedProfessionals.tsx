
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import type { ProfessionalTable } from '@/lib/api/database-types';

// Separate interface for the profile response
interface ClientProfile {
  professional_id: string;
}

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      try {
        // Explicitly type the profile response
        const { data: profile } = await supabase
          .from('client_profiles')
          .select<'client_profiles', ClientProfile>('professional_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.professional_id) {
          return [];
        }

        // Fetch professional with explicit typing
        const { data: professionals } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', profile.professional_id);

        if (!professionals?.length) {
          return [];
        }

        // Transform each professional with proper typing
        return professionals.map((prof) => 
          transformProfessional(prof as ProfessionalTable)
        );

      } catch (error) {
        console.error('Error fetching professionals:', error);
        return [];
      }
    },
    enabled: !!user
  });
};
