
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Professional } from '../types/modelTypes';
import { getProfessionalForUser } from '../services/professionalService';

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
