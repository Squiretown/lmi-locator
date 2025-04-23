
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { ProfessionalTable } from '@/lib/api/database-types';

// Define a simple type for the client_profiles query result outside the function
type ClientProfileResult = {
  professional_id: string | null;
};

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];

      try {
        // Use the pre-defined type rather than inline definition
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
        // We need to manually cast the database records to ensure the type fields are handled correctly
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
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
