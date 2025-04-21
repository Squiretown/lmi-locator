
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { ProfessionalTable } from '@/lib/api/database-types';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { useAuth } from '@/hooks/useAuth';

// Define explicit types for query responses to avoid deep type inference
type ClientProfileResponse = { professional_id: string | null };

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];

      try {
        // First get client profile to find the professional_id
        // Use explicit typing to prevent excessive type instantiation
        const { data, error } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle<ClientProfileResponse>();

        if (error) {
          console.error('Error fetching client profile:', error);
          return [];
        }

        if (!data?.professional_id) {
          return [];
        }
        
        // Fetch professionals
        const { data: professionals, error: professionalError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', data.professional_id);
          
        if (professionalError) {
          console.error('Error fetching professionals:', professionalError);
          return [];
        }
        
        // Transform the results
        return (professionals || []).map(pro => transformProfessional(pro as ProfessionalTable));
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
