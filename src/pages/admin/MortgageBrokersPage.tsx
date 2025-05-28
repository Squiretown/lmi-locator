
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchBrokers, MortgageBroker, BrokerFormValues } from '@/lib/api/brokers';
import BrokerDialog from '@/components/brokers/BrokerDialog';
import { InviteBrokerDialog } from '@/components/brokers/InviteBrokerDialog';
import { BrokersPageHeader } from '@/components/brokers/BrokersPageHeader';
import { BrokersSearch } from '@/components/brokers/BrokersSearch';
import { BrokersTable } from '@/components/brokers/BrokersTable';
import { DeleteBrokerDialog } from '@/components/brokers/DeleteBrokerDialog';
import { useBrokerOperations } from '@/hooks/useBrokerOperations';

const MortgageBrokersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<MortgageBroker | null>(null);
  
  const { data: brokers, isLoading, error } = useQuery({
    queryKey: ['brokers'],
    queryFn: fetchBrokers
  });

  const {
    createBrokerMutation,
    updateBrokerMutation,
    deleteBrokerMutation,
  } = useBrokerOperations();

  const handleAddBroker = async (data: BrokerFormValues) => {
    await createBrokerMutation.mutateAsync(data);
    setAddDialogOpen(false);
  };

  const handleEditBroker = async (data: BrokerFormValues) => {
    if (!selectedBroker) return;
    await updateBrokerMutation.mutateAsync({ id: selectedBroker.id, data });
    setEditDialogOpen(false);
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

  const filteredBrokers = brokers?.filter(broker => 
    broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-6">
          <BrokersPageHeader
            onInviteClick={() => setInviteDialogOpen(true)}
            onAddClick={() => setAddDialogOpen(true)}
          />

          <BrokersSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <BrokersTable
            brokers={filteredBrokers}
            isLoading={isLoading}
            error={error}
            onEditBroker={openEditDialog}
            onDeleteBroker={openDeleteDialog}
          />
        </CardContent>
      </Card>

      <BrokerDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddBroker}
        isEditMode={false}
        initialValues={null}
      />

      {selectedBroker && (
        <BrokerDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleEditBroker}
          isEditMode={true}
          initialValues={selectedBroker}
        />
      )}

      <DeleteBrokerDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        broker={selectedBroker}
        onConfirm={handleDeleteBroker}
        isDeleting={deleteBrokerMutation.isPending}
      />

      <InviteBrokerDialog
        isOpen={inviteDialogOpen}
        setIsOpen={setInviteDialogOpen}
      />
    </div>
  );
};

export default MortgageBrokersPage;
