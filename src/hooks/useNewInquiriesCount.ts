import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNewInquiriesCount = () => {
  const queryClient = useQueryClient();

  const { data: count = 0, isLoading } = useQuery({
    queryKey: ['contact_inquiries_count', 'new'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      if (error) throw error;
      return count || 0;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const channel = supabase
      .channel('contact-inquiries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_inquiries',
        },
        () => {
          queryClient.invalidateQueries(['contact_inquiries_count', 'new']);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { count, isLoading };
};
