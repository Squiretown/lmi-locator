
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
    queryFn: async () => {
      if (!user) return [];

      // First try to get professionals from client_profiles (if they were invited)
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('professional_id')
        .eq('user_id', user.id)
        .single();

      if (clientProfile?.professional_id) {
        const { data: professionals, error } = await supabase
          .from('professionals')
          .select('*')
          .in('type', ['realtor', 'mortgage_broker'])
          .eq('status', 'active')
          .eq('id', clientProfile.professional_id);

        if (error) throw error;
        return (professionals || []).map((item) => transformProfessional(item as ProfessionalTable));
      }

      // If no invited professional found, return empty array
      // In a real app, you might want to show a message to connect with a professional
      return [];
    },
    enabled: !!user
  });
};
