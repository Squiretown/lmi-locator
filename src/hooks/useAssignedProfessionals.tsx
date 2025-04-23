import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { transformProfessional } from '@/lib/api/utils/transformers';
import { ProfessionalTable } from '@/lib/api/database-types';

// Explicitly define a simple type without complex inference
type ClientProfileResult = { 
  professional_id: string | null 
};

export const useAssignedProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async (): Promise<Professional[]> => {
      if (!user) return [];

      // Use type assertion to help TypeScript
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('professional_id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Explicit type check and assertion
      const validProfile = profile as ClientProfileResult | null;
      if (!validProfile?.professional_id) return [];

      // 2️⃣ fetch the professional record(s)
      const { data: professionals } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', validProfile.professional_id);

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
