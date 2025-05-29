

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRealtor, updateRealtor, deleteRealtor, RealtorFormValues } from '@/lib/api/realtors';

export const useRealtorOperations = () => {
  const queryClient = useQueryClient();

  const createRealtorMutation = useMutation({
    mutationFn: createRealtor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
    },
    onError: (error) => {
      console.error('Failed to create realtor:', error);
    }
  });

  const updateRealtorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: RealtorFormValues }) => 
      updateRealtor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
    },
    onError: (error) => {
      console.error('Failed to update realtor:', error);
    }
  });

  const deleteRealtorMutation = useMutation({
    mutationFn: deleteRealtor,
    onSuccess: () => {
      // Remove the specific item from cache and invalidate
      queryClient.removeQueries({ queryKey: ['realtors'] });
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
      console.log('Realtor deleted successfully - cache cleared');
    },
    onError: (error) => {
      console.error('Failed to delete realtor:', error);
    }
  });

  return {
    createRealtorMutation,
    updateRealtorMutation,
    deleteRealtorMutation,
  };
};

