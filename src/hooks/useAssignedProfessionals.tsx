
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { ProfessionalTable } from '@/lib/api/database-types';

export const useAssignedProfessionals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      // Early return if no user
      if (!user) return [];
      
      try {
        // First, fetch the client profile to get the professional ID
        const { data: profile, error: profileError } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .single();
          
        if (profileError || !profile || !profile.professional_id) {
          console.error('No professional found for this client', profileError);
          return [];
        }
        
        // Now fetch the professional's details
        const { data: professionals, error: profError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', profile.professional_id);
        
        if (profError || !professionals || professionals.length === 0) {
          console.error('Error fetching professional details', profError);
          return [];
        }
        
        // Transform the raw database objects to Professional interface objects
        return professionals.map(rawProf => {
          return transformProfessional(rawProf as ProfessionalTable);
        });
      } catch (error) {
        console.error('Error in useAssignedProfessionals:', error);
        return [];
      }
    },
    enabled: !!user
  });
};
