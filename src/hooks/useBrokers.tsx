
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { 
  fetchBrokers, 
  createBroker, 
  updateBroker, 
  deleteBroker,
  getBrokerPermissions,
  addPermissionToBroker, 
  removePermissionFromBroker 
} from '@/lib/api/brokers';
import type { MortgageBroker, BrokerFormValues } from '@/lib/api/types';

/**
 * Custom hook for managing mortgage broker data and operations
 */
export function useBrokers() {
  const queryClient = useQueryClient();

  // Query for fetching all brokers
  const { 
    data: brokers = [],
    isLoading: isLoadingBrokers,
    error: brokersError,
    refetch: refetchBrokers
  } = useQuery({
    queryKey: ['brokers'],
    queryFn: fetchBrokers
  });

  // Mutation for creating a new broker
  const { mutateAsync: createBrokerMutation, isPending: isCreating } = useMutation({
    mutationFn: (broker: BrokerFormValues) => createBroker(broker),
    onSuccess: () => {
      toast.success('Broker created successfully');
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create broker: ${error.message}`);
    }
  });

  // Mutation for updating an existing broker
  const { mutateAsync: updateBrokerMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, broker }: { id: string; broker: BrokerFormValues }) => 
      updateBroker(id, broker),
    onSuccess: () => {
      toast.success('Broker updated successfully');
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update broker: ${error.message}`);
    }
  });

  // Mutation for deleting a broker
  const { mutateAsync: deleteBrokerMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteBroker(id),
    onSuccess: () => {
      toast.success('Broker deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete broker: ${error.message}`);
    }
  });

  // Query hook for fetching broker permissions
  const getBrokerPermissionsQuery = (brokerId: string) => useQuery({
    queryKey: ['broker-permissions', brokerId],
    queryFn: () => getBrokerPermissions(brokerId),
    enabled: !!brokerId,
  });

  // Mutation for adding a permission to a broker
  const useAddPermission = () => {
    return useMutation({
      mutationFn: ({ brokerId, permissionName }: { brokerId: string; permissionName: string }) => 
        addPermissionToBroker(brokerId, permissionName),
      onSuccess: (_, { brokerId }) => {
        toast.success('Permission added successfully');
        queryClient.invalidateQueries({ queryKey: ['broker-permissions', brokerId] });
      },
      onError: (error: Error) => {
        toast.error(`Failed to add permission: ${error.message}`);
      }
    });
  };

  // Mutation for removing a permission from a broker
  const useRemovePermission = () => {
    return useMutation({
      mutationFn: ({ brokerId, permissionName }: { brokerId: string; permissionName: string }) => 
        removePermissionFromBroker(brokerId, permissionName),
      onSuccess: (_, { brokerId }) => {
        toast.success('Permission removed successfully');
        queryClient.invalidateQueries({ queryKey: ['broker-permissions', brokerId] });
      },
      onError: (error: Error) => {
        toast.error(`Failed to remove permission: ${error.message}`);
      }
    });
  };

  return {
    // Data
    brokers,
    
    // Loading states
    isLoadingBrokers,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error states
    brokersError,
    
    // Methods
    createBroker: createBrokerMutation,
    updateBroker: updateBrokerMutation,
    deleteBroker: deleteBrokerMutation,
    refetchBrokers,
    
    // Permission utilities
    getBrokerPermissionsQuery,
    useAddPermission,
    useRemovePermission
  };
}
