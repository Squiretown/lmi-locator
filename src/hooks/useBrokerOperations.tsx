
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBroker, updateBroker, deleteBroker, BrokerFormValues } from '@/lib/api/brokers';
import { toast } from 'sonner';

export const useBrokerOperations = () => {
  const queryClient = useQueryClient();

  const createBrokerMutation = useMutation({
    mutationFn: createBroker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast.success('Broker added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add broker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const updateBrokerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: BrokerFormValues }) => 
      updateBroker(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast.success('Broker updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update broker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const deleteBrokerMutation = useMutation({
    mutationFn: deleteBroker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast.success('Broker deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete broker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    createBrokerMutation,
    updateBrokerMutation,
    deleteBrokerMutation,
  };
};
