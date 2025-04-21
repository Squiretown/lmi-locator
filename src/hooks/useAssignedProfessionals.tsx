
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
        const { data: clientProfile, error: profileError } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching client profile:', profileError);
          return [];
        }

        if (!clientProfile?.professional_id) {
          return [];
        }
        
        // Fetch professionals
        const { data: professionals, error: professionalError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', clientProfile.professional_id);
          
        if (professionalError) {
          console.error('Error fetching professionals:', professionalError);
          return [];
        }
        
        // Transform the results - ensure we're passing each professional object individually
        return (professionals || []).map(pro => {
          // Explicitly cast each item to ProfessionalTable
          return transformProfessional(pro as ProfessionalTable);
        });
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
