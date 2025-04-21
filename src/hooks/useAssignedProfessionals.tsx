
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
        // First try to get professionals from client_profiles with explicit typing
        type ClientProfileResult = { professional_id: string | null };
        
        const { data: clientProfile, error: profileError } = await supabase
          .from('client_profiles')
          .select<'professional_id', ClientProfileResult>('professional_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching client profile:', profileError);
          return [];
        }

        if (!clientProfile?.professional_id) {
          return [];
        }
        
        // Fetch professionals with explicit typing
        type ProfessionalResult = ProfessionalTable[];
        
        const { data: professionals, error: professionalError } = await supabase
          .from('professionals')
          .select<'*', ProfessionalResult>('*')
          .eq('id', clientProfile.professional_id);
          
        if (professionalError) {
          console.error('Error fetching professionals:', professionalError);
          return [];
        }
        
        // Transform the results with type safety
        return (professionals || []).map(pro => transformProfessional(pro));
      } catch (err) {
        console.error('Error in useAssignedProfessionals:', err);
        return [];
      }
    },
    enabled: !!user
  });
};
