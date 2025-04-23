
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
      if (!user) return [];

      try {
        // Define a simple type for the client_profiles query result
        type ClientProfileResult = {
          professional_id: string | null;
        };

        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle<ClientProfileResult>();

        if (!clientProfile?.professional_id) {
          return [];
        }

        const { data: professionals } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', clientProfile.professional_id);

        // Transform the Supabase response to match our Professional interface
        // We need to manually cast the database records to ensure the 'type' field is handled correctly
        return professionals ? professionals.map(prof => {
          // Ensure the type value conforms to the expected union type
          const professionalWithValidType: ProfessionalTable = {
            ...prof,
            type: (prof.type === 'realtor' || prof.type === 'mortgage_broker') 
              ? prof.type 
              : 'realtor' // Default to 'realtor' if type is invalid
          };
          return transformProfessional(professionalWithValidType);
        }) : [];
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
