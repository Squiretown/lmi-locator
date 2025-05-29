
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRealtor, updateRealtor, deleteRealtor, RealtorFormValues } from '@/lib/api/realtors';

export const useRealtorOperations = () => {
  const queryClient = useQueryClient();

  const createRealtorMutation = useMutation({
    mutationFn: createRealtor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
      console.log('Realtor created successfully');
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
      console.log('Realtor updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update realtor:', error);
    }
  });

  const deleteRealtorMutation = useMutation({
    mutationFn: deleteRealtor,
    onSuccess: (data, variables) => {
      console.log('Delete mutation successful for ID:', variables);
      // Remove all cached realtor queries and refetch
      queryClient.removeQueries({ queryKey: ['realtors'] });
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
      // Force an immediate refetch
      queryClient.refetchQueries({ queryKey: ['realtors'] });
      console.log('Realtor deleted successfully - cache cleared and refetched');
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
