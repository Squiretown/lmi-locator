import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MortgageProfessional {
  id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  user_id: string;
}

export function useMortgageProfessionals() {
  const { data: mortgageProfessionals = [], isLoading } = useQuery({
    queryKey: ['mortgage-professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('type', 'mortgage_professional')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data as MortgageProfessional[];
    },
  });

  return {
    mortgageProfessionals,
    isLoading,
  };
}