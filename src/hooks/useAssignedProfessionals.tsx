
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Professional } from '@/lib/api/types';
import { fetchProfessionals } from '@/lib/api/professionals';

export const useAssignedProfessionals = () => {
  const { user } = useAuth();
  
  return useQuery<Professional[], Error>({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return fetchProfessionals();
    },
    enabled: !!user
  });
};
