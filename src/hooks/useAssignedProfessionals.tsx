
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
        // First get client profile to find the professional_id
        const clientProfileResponse = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (clientProfileResponse.error) {
          console.error('Error fetching client profile:', clientProfileResponse.error);
          return [];
        }

        const clientProfile = clientProfileResponse.data;
        if (!clientProfile?.professional_id) {
          return [];
        }
        
        // Fetch professionals
        const professionalsResponse = await supabase
          .from('professionals')
          .select('*')
          .eq('id', clientProfile.professional_id);
          
        if (professionalsResponse.error) {
          console.error('Error fetching professionals:', professionalsResponse.error);
          return [];
        }
        
        const professionals = professionalsResponse.data || [];
        
        // Transform the results - ensure we're passing each professional object individually
        return professionals.map(pro => transformProfessional(pro as ProfessionalTable));
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
