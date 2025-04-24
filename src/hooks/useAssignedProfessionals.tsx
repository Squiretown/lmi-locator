
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { ProfessionalTable } from '@/lib/api/database-types';

export const useAssignedProfessionals = () => {
  const { user } = useAuth();
  
  // Helper function for fetching professional ID with simplified typing
  const fetchProfessionalId = async (userId: string): Promise<string | null> => {
    // Use explicit type assertion to break potential circular references
    const response = await supabase
      .from('client_profiles')
      .select('professional_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Safely access the data without complex type inference
    return response.data?.professional_id || null;
  };
  
  // Helper function for fetching professionals with simplified typing
  const fetchProfessionals = async (professionalId: string): Promise<Professional[]> => {
    const response = await supabase
      .from('professionals')
      .select('*')
      .eq('id', professionalId);
    
    const professionals = response.data || [];
    
    if (!professionals.length) return [];
    
    return professionals.map(prof => {
      // Ensure proper type validation
      const validProf = {
        ...prof,
        type: (['realtor', 'mortgage_broker'].includes(prof.type) ? prof.type : 'realtor') as 'realtor' | 'mortgage_broker',
        status: (['active', 'pending', 'inactive'].includes(prof.status) ? prof.status : 'pending') as 'active' | 'pending' | 'inactive'
      };
      
      return transformProfessional(validProf as ProfessionalTable);
    });
  };
  
  // Main query
  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];
      
      const professionalId = await fetchProfessionalId(user.id);
      if (!professionalId) return [];
      
      return fetchProfessionals(professionalId);
    },
    enabled: !!user
  });
};
