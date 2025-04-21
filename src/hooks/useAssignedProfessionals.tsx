
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
    queryFn: async () => {
      if (!user) return [];

      try {
        // First try to get professionals from client_profiles
        const { data: clientProfile, error: profileError } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching client profile:', profileError);
          return [];
        }

        if (clientProfile?.professional_id) {
          // Explicitly typed query to avoid deep type instantiation
          const professionalQuery = await supabase
            .from('professionals')
            .select('*')
            .eq('id', clientProfile.professional_id);
            
          const professionals = professionalQuery.data || [];
          const proError = professionalQuery.error;

          if (proError) {
            console.error('Error fetching professionals:', proError);
            return [];
          }

          // Transform the results to match the Professional interface
          return professionals.map(pro => transformProfessional(pro as ProfessionalTable));
        }

        // If no invited professional found, return empty array
        return [];
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
