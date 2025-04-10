
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBrokers, createBroker, updateBroker, deleteBroker, MortgageBroker } from '@/lib/api/brokers';
import { toast } from 'sonner';
import BrokerDialog from '@/components/brokers/BrokerDialog';
import { BrokerFormValues } from '@/components/brokers/BrokerForm';
import BrokerPermissionsDialog from '@/components/brokers/BrokerPermissionsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6" />
              <CardTitle>Mortgage Brokers Management</CardTitle>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Broker</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brokers..."
                className="pl-8 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading brokers...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error loading brokers: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrokers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No brokers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBrokers?.map(broker => (
                      <TableRow key={broker.id}>
                        <TableCell className="font-medium">{broker.name}</TableCell>
                        <TableCell>{broker.company}</TableCell>
                        <TableCell>{broker.license_number}</TableCell>
                        <TableCell>
                          <div>{broker.email}</div>
                          <div className="text-xs text-muted-foreground">{broker.phone}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            broker.status === 'active' ? 'bg-green-100 text-green-800' :
                            broker.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {broker.status.charAt(0).toUpperCase() + broker.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(broker)}
                              title="Edit broker"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openDeleteDialog(broker)}
                              title="Delete broker"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openPermissionsDialog(broker)}
                              title="Manage permissions"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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
