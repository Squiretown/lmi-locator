import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchOptions {
  query: string;
  excludeIds?: string[];
  professionalType?: 'mortgage_professional' | 'realtor';
  excludeSelf?: boolean;
}

export function useProfessionalSearch(options: SearchOptions) {
  const { query, excludeIds = [], professionalType, excludeSelf = true } = options;

  // Get current user's professional ID
  const { data: currentProfessionalId } = useQuery({
    queryKey: ['current-professional-id'],
    queryFn: async () => {
      if (!excludeSelf) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      return data?.id;
    },
    enabled: excludeSelf
  });

  // Search professionals
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['professional-search', query, professionalType, excludeIds],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('professionals')
        .select('id, name, company, email, phone, license_number, professional_type, status')
        .eq('status', 'active')
        .limit(50);

      // Filter by type if specified
      if (professionalType) {
        queryBuilder = queryBuilder.eq('professional_type', professionalType);
      }

      // Exclude IDs
      const allExcludeIds = [...excludeIds];
      if (excludeSelf && currentProfessionalId) {
        allExcludeIds.push(currentProfessionalId);
      }
      
      if (allExcludeIds.length > 0) {
        queryBuilder = queryBuilder.not('id', 'in', `(${allExcludeIds.join(',')})`);
      }

      // Text search (if query provided)
      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,license_number.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2 // Only search with 2+ characters
  });

  return {
    results,
    isLoading,
    hasResults: results.length > 0
  };
}
