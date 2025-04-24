
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import type { ProfessionalTable } from '@/lib/api/database-types';

// Simple interface for the client profile data we need
interface ClientProfileData {
  professional_id: string | null;
}

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];
      
      try {
        // Use a simpler approach to fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching client profile:', profileError);
          return [];
        }
        
        // Type assertion to avoid deep type instantiation
        const profile = profileData as ClientProfileData | null;
        if (!profile?.professional_id) {
          return [];
        }
        
        // Fetch professional data
        const { data: professionalsData, error: profsError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', profile.professional_id);
        
        if (profsError || !professionalsData?.length) {
          console.error('Error fetching professionals:', profsError);
          return [];
        }
        
        // Transform the professionals data
        return professionalsData.map(rawProf => {
          const professionalRecord = rawProf as unknown as ProfessionalTable;
          return transformProfessional(professionalRecord);
        });
      } catch (error) {
        console.error('Unexpected error in useAssignedProfessionals:', error);
        return [];
      }
    },
    enabled: !!user
  });
};
