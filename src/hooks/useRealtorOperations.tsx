
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRealtor, updateRealtor, deleteRealtor, RealtorFormValues } from '@/lib/api/realtors';
import { toast } from 'sonner';

export const useRealtorOperations = () => {
  const queryClient = useQueryClient();

  const createRealtorMutation = useMutation({
    mutationFn: createRealtor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
      toast.success('Realtor added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add realtor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const updateRealtorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: RealtorFormValues }) => 
      updateRealtor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
      toast.success('Realtor updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update realtor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const deleteRealtorMutation = useMutation({
    mutationFn: deleteRealtor,
    onSuccess: () => {
      // Force a refetch of the realtors data
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
      queryClient.refetchQueries({ queryKey: ['realtors'] });
      toast.success('Realtor deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete realtor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    createRealtorMutation,
    updateRealtorMutation,
    deleteRealtorMutation,
  };
};
