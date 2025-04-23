
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { ProfessionalTable } from '@/lib/api/database-types';

// Define a simple interface to break the type recursion
interface ClientProfileData {
  professional_id: string | null;
}

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];

      // Use any as an intermediate type to completely break the type recursion
      const profileResult = await supabase
        .from('client_profiles')
        .select('professional_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // First cast to any to break any deep type instantiation
      const rawData: any = profileResult.data;
      // Then cast to our simple interface
      const professionalId: string | null = rawData?.professional_id || null;
      
      if (!professionalId) return [];

      const { data: professionals } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', professionalId);

      // Transform the Supabase response to match our Professional interface
      return professionals ? professionals.map(prof => {
        // Create a properly typed ProfessionalTable object with proper validation
        const professionalWithValidType: ProfessionalTable = {
          ...prof,
          type: (prof.type === 'realtor' || prof.type === 'mortgage_broker') 
            ? prof.type 
            : 'realtor', // Default to 'realtor' if type is invalid
          status: (prof.status === 'active' || prof.status === 'pending' || prof.status === 'inactive')
            ? prof.status
            : 'pending' // Default to 'pending' if status is invalid
        };
        return transformProfessional(professionalWithValidType);
      }) : [];
    },
    enabled: !!user
  });
};
