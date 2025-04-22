
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { ProfessionalTable } from '@/lib/api/database-types';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { useAuth } from '@/hooks/useAuth';

// Define explicit return types to prevent deep type inference
interface ClientProfileResponse {
  professional_id: string;
}

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];

      try {
        // Get client profile with simplified query and explicit typing
        const { data: profile, error: profileError } = await supabase
          .from('client_profiles')
          .select('professional_id')
          .eq('user_id', user.id)
          .maybeSingle<ClientProfileResponse>();

        if (profileError || !profile?.professional_id) {
          return [];
        }

        // Get professionals with simplified query
        const { data: professionals, error: professionalsError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', profile.professional_id);

        if (professionalsError || !professionals) {
          return [];
        }

        // Transform the professionals data
        return professionals.map(pro => transformProfessional(pro as ProfessionalTable));
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
