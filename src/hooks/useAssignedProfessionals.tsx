
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { ProfessionalTable } from '@/lib/api/database-types';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { useAuth } from '@/hooks/useAuth';

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];

      try {
        const { data: profile, error: profileError } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile?.professional_id) {
          return [];
        }

        const { data: professionals, error: professionalsError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', profile.professional_id);

        if (professionalsError || !professionals) {
          return [];
        }

        return professionals.map(pro => transformProfessional(pro as ProfessionalTable));
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
