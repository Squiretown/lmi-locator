
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Professional } from '../lib/types/modelTypes';
import { getProfessionalForUser } from '../lib/services/professionalService';

export const useAssignedProfessionals = () => {
  const { user } = useAuth();
  
  return useQuery<Professional[], Error>({
    queryKey: ['assigned-professionals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return getProfessionalForUser(user.id);
    },
    enabled: !!user
  });
};
