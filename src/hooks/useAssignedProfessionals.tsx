
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { ProfessionalTable } from '@/lib/api/database-types';

// Custom type for professional ID query result
type ProfessionalIdResult = { professional_id: string | null };

export const useAssignedProfessionals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];
      
      // Step 1: Get professional ID with explicit typing
      const { data: profileData } = await supabase
        .from('client_profiles')
        .select('professional_id')
        .eq('user_id', user.id)
        .maybeSingle<ProfessionalIdResult>();
        
      const professionalId = profileData?.professional_id;
      if (!professionalId) return [];
      
      // Step 2: Get professional data with explicit typing
      const { data: professionals } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', professionalId);
      
      if (!professionals || professionals.length === 0) return [];
      
      // Step 3: Transform with explicit casting
      return professionals.map(prof => {
        // Validate and cast fields to expected types
        const validProf: ProfessionalTable = {
          ...prof,
          type: (['realtor', 'mortgage_broker'].includes(prof.type) ? prof.type : 'realtor') as 'realtor' | 'mortgage_broker',
          status: (['active', 'pending', 'inactive'].includes(prof.status) ? prof.status : 'pending') as 'active' | 'pending' | 'inactive'
        } as ProfessionalTable;
        
        return transformProfessional(validProf);
      });
    },
    enabled: !!user
  });
};
