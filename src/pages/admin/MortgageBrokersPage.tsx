import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchBrokers, createBroker, updateBroker, deleteBroker, getBrokerPermissions } from '@/lib/api/brokers';
import type { MortgageBroker, BrokerFormValues } from '@/lib/api/types';
import BrokerDialog from '@/components/brokers/BrokerDialog';
import BrokerTable from '@/components/brokers/BrokerTable';
import BrokerHeader from '@/components/brokers/BrokerHeader';
import BrokerSearch from '@/components/brokers/BrokerSearch';
import BrokerPermissionsDialog from '@/components/brokers/BrokerPermissionsDialog';

const MortgageBrokersPage: React.FC = () => {
  const [brokers, setBrokers] = useState<MortgageBroker[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<MortgageBroker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [brokerPermissions, setBrokerPermissions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    try {
      const brokersData = await fetchBrokers();
      setBrokers(brokersData);
    } catch (error: any) {
      toast({
        title: 'Error loading brokers',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

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
      setBrokers(brokers.filter((broker) => broker.id !== id));
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
        const updatedBroker = await updateBroker(selectedBroker.id, values);
        setBrokers(brokers.map((broker) => (broker.id === updatedBroker.id ? updatedBroker : broker)));
        toast({
          title: 'Broker updated',
          description: 'Broker successfully updated.',
          duration: 3000
        });
      } else {
        const newBroker = await createBroker(values);
        setBrokers([...brokers, newBroker]);
        toast({
          title: 'Broker created',
          description: 'Broker successfully created.',
          duration: 3000
        });
      }
      setIsDialogOpen(false);
      loadBrokers();
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
    try {
      const permissions = await getBrokerPermissions(broker.id);
      setBrokerPermissions(permissions);
      setIsPermissionsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error fetching permissions',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleClosePermissionsDialog = () => {
    setIsPermissionsDialogOpen(false);
    setSelectedBroker(null);
  };

  return (
    <div className="container mx-auto p-4">
      <BrokerHeader onCreate={handleCreateBroker} />
      <BrokerSearch value={searchQuery} onChange={handleSearchChange} />
      <BrokerTable
        brokers={filteredBrokers}
        onEdit={handleEditBroker}
        onDelete={handleDeleteBroker}
        onOpenPermissions={handleOpenPermissionsDialog}
      />
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
