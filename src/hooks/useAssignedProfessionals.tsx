
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { ProfessionalTable } from '@/lib/api/database-types';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { useAuth } from '@/hooks/useAuth';

// Define simplified types for our responses to avoid deep type inference
type ClientProfileResponse = { professional_id: string | null };
type ProfessionalResponse = ProfessionalTable;

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];

      try {
        // First get client profile to find the professional_id
        // Avoid type inference by using explicit string type casting
        const clientProfileResult = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (clientProfileResult.error) {
          console.error('Error fetching client profile:', clientProfileResult.error);
          return [];
        }

        const professionalId = clientProfileResult.data?.professional_id;
        if (!professionalId) {
          return [];
        }
        
        // Fetch professionals with explicit typing
        const professionalsResult = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professionalId);
          
        if (professionalsResult.error) {
          console.error('Error fetching professionals:', professionalsResult.error);
          return [];
        }
        
        // Transform the results with explicit casting
        return (professionalsResult.data || []).map(pro => 
          transformProfessional(pro as ProfessionalTable)
        );
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
