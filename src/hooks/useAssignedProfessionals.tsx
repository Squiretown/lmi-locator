
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/lib/api/types';

export const useAssignedProfessionals = () => {
  return useQuery({
    queryKey: ['assigned-professionals'],
    queryFn: async () => {
      const { data: professionals, error } = await supabase
        .from('professionals')
        .select('*')
        .in('type', ['realtor', 'mortgage_broker'])
        .eq('status', 'active')
        .limit(2);

      if (error) throw error;
      return professionals as Professional[];
    }
  });
};
