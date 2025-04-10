
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { MortgageBroker, BrokerFormValues } from '@/lib/api/types';
import BrokerDialog from '@/components/brokers/BrokerDialog';
import BrokerTable from '@/components/brokers/BrokerTable';
import BrokerHeader from '@/components/brokers/BrokerHeader';
import BrokerSearch from '@/components/brokers/BrokerSearch';
import BrokerPermissionsDialog from '@/components/brokers/BrokerPermissionsDialog';
import { useBrokers } from '@/hooks/useBrokers';

const MortgageBrokersPage: React.FC = () => {
  const [selectedBroker, setSelectedBroker] = useState<MortgageBroker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  
  const { 
    brokers, 
    isLoadingBrokers, 
    createBroker, 
    updateBroker, 
    deleteBroker, 
    getBrokerPermissionsQuery 
  } = useBrokers();
  
  const { toast } = useToast();

  // Get broker permissions when a broker is selected
  const { data: brokerPermissions = [] } = getBrokerPermissionsQuery(
    selectedBroker?.id || ''
  );

  const handleCreateBroker = () => {
    setSelectedBroker(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEditBroker = (broker: MortgageBroker) => {
    setSelectedBroker(broker);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteBroker = async (id: string) => {
    try {
      await deleteBroker(id);
      toast({
        title: 'Broker deleted',
        description: 'Broker successfully deleted.',
        duration: 3000
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting broker',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedBroker(null);
  };

  const handleSaveBroker = async (values: BrokerFormValues) => {
    try {
      if (isEditMode && selectedBroker) {
        await updateBroker({ id: selectedBroker.id, broker: values });
      } else {
        await createBroker(values);
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error saving broker',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredBrokers = brokers.filter((broker) =>
    broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPermissionsDialog = async (broker: MortgageBroker) => {
    setSelectedBroker(broker);
    setIsPermissionsDialogOpen(true);
  };

  const handleClosePermissionsDialog = () => {
    setIsPermissionsDialogOpen(false);
    setSelectedBroker(null);
  };

  return (
    <div className="container mx-auto p-4">
      <BrokerHeader onCreate={handleCreateBroker} />
      <BrokerSearch value={searchQuery} onChange={handleSearchChange} />
      {isLoadingBrokers ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <BrokerTable
          brokers={filteredBrokers}
          onEdit={handleEditBroker}
          onDelete={handleDeleteBroker}
          onOpenPermissions={handleOpenPermissionsDialog}
        />
      )}
      <BrokerDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveBroker}
        isEditMode={isEditMode}
        initialValues={selectedBroker}
      />
      {selectedBroker && (
        <BrokerPermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onClose={handleClosePermissionsDialog}
          brokerId={selectedBroker.id}
          initialPermissions={brokerPermissions}
        />
      )}
    </div>
  );
};

export default MortgageBrokersPage;
