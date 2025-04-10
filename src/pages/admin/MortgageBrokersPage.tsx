
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBrokers, createBroker, updateBroker, deleteBroker, MortgageBroker } from '@/lib/api/brokers';
import { toast } from 'sonner';
import BrokerDialog from '@/components/brokers/BrokerDialog';
import { BrokerFormValues } from '@/components/brokers/BrokerForm';
import BrokerPermissionsDialog from '@/components/brokers/BrokerPermissionsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import BrokerTable from '@/components/brokers/BrokerTable';
import BrokerSearch from '@/components/brokers/BrokerSearch';
import BrokerHeader from '@/components/brokers/BrokerHeader';

const MortgageBrokersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<MortgageBroker | null>(null);
  
  const queryClient = useQueryClient();

  // Query to fetch brokers
  const { data: brokers, isLoading, error } = useQuery({
    queryKey: ['mortgageBrokers'],
    queryFn: fetchBrokers
  });

  // Mutations for broker operations
  const createBrokerMutation = useMutation({
    mutationFn: createBroker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgageBrokers'] });
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
      queryClient.invalidateQueries({ queryKey: ['mortgageBrokers'] });
      toast.success('Broker updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update broker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const deleteBrokerMutation = useMutation({
    mutationFn: deleteBroker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgageBrokers'] });
      toast.success('Broker deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete broker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleAddBroker = async (data: BrokerFormValues) => {
    await createBrokerMutation.mutateAsync(data);
  };

  const handleEditBroker = async (data: BrokerFormValues) => {
    if (!selectedBroker) return;
    await updateBrokerMutation.mutateAsync({ id: selectedBroker.id, data });
  };

  const handleDeleteBroker = async () => {
    if (!selectedBroker) return;
    await deleteBrokerMutation.mutateAsync(selectedBroker.id);
    setDeleteDialogOpen(false);
  };

  const openEditDialog = (broker: MortgageBroker) => {
    setSelectedBroker(broker);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (broker: MortgageBroker) => {
    setSelectedBroker(broker);
    setDeleteDialogOpen(true);
  };

  const openPermissionsDialog = (broker: MortgageBroker) => {
    setSelectedBroker(broker);
    setPermissionsDialogOpen(true);
  };

  const filteredBrokers = brokers?.filter(broker => 
    broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <Card>
        <BrokerHeader onAddBroker={() => setAddDialogOpen(true)} />
        <CardContent>
          <BrokerSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />

          <BrokerTable 
            brokers={filteredBrokers} 
            isLoading={isLoading} 
            error={error instanceof Error ? error : null}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onManagePermissions={openPermissionsDialog}
          />
        </CardContent>
      </Card>

      {/* Add Broker Dialog */}
      <BrokerDialog
        isOpen={addDialogOpen}
        setIsOpen={setAddDialogOpen}
        onSubmit={handleAddBroker}
        isLoading={createBrokerMutation.isPending}
        title="Add New Broker"
      />

      {/* Edit Broker Dialog */}
      {selectedBroker && (
        <BrokerDialog
          isOpen={editDialogOpen}
          setIsOpen={setEditDialogOpen}
          onSubmit={handleEditBroker}
          defaultValues={selectedBroker}
          isLoading={updateBrokerMutation.isPending}
          title="Edit Broker"
        />
      )}

      {/* Broker Permissions Dialog */}
      {selectedBroker && (
        <BrokerPermissionsDialog
          isOpen={permissionsDialogOpen}
          setIsOpen={setPermissionsDialogOpen}
          brokerId={selectedBroker.id}
          brokerName={selectedBroker.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the broker 
              {selectedBroker && <span className="font-semibold"> {selectedBroker.name}</span>} 
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBroker}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBrokerMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MortgageBrokersPage;
