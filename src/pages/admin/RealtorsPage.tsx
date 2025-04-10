
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRealtors, createRealtor, updateRealtor, deleteRealtor, Realtor, RealtorFormValues } from '@/lib/api/realtors';
import { toast } from 'sonner';
import RealtorDialog from '@/components/realtors/RealtorDialog';
import RealtorPermissionsDialog from '@/components/realtors/RealtorPermissionsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import RealtorTable from '@/components/realtors/RealtorTable';
import RealtorSearch from '@/components/realtors/RealtorSearch';
import RealtorHeader from '@/components/realtors/RealtorHeader';

const RealtorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRealtor, setSelectedRealtor] = useState<Realtor | null>(null);
  
  const queryClient = useQueryClient();

  // Query to fetch realtors
  const { data: realtors, isLoading, error } = useQuery({
    queryKey: ['realtors'],
    queryFn: fetchRealtors
  });

  // Mutations for realtor operations
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
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
      toast.success('Realtor deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete realtor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleAddRealtor = async (data: RealtorFormValues) => {
    await createRealtorMutation.mutateAsync(data);
  };

  const handleEditRealtor = async (data: RealtorFormValues) => {
    if (!selectedRealtor) return;
    await updateRealtorMutation.mutateAsync({ id: selectedRealtor.id, data });
  };

  const handleDeleteRealtor = async () => {
    if (!selectedRealtor) return;
    await deleteRealtorMutation.mutateAsync(selectedRealtor.id);
    setDeleteDialogOpen(false);
  };

  const openEditDialog = (realtor: Realtor) => {
    setSelectedRealtor(realtor);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (realtor: Realtor) => {
    setSelectedRealtor(realtor);
    setDeleteDialogOpen(true);
  };

  const openPermissionsDialog = (realtor: Realtor) => {
    setSelectedRealtor(realtor);
    setPermissionsDialogOpen(true);
  };

  const filteredRealtors = realtors?.filter(realtor => 
    realtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    realtor.brokerage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (realtor.license_number && realtor.license_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (realtor.email && realtor.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 space-y-4">
      <Card>
        <RealtorHeader onAddRealtor={() => setAddDialogOpen(true)} />
        <CardContent>
          <RealtorSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />

          <RealtorTable 
            realtors={filteredRealtors} 
            isLoading={isLoading} 
            error={error instanceof Error ? error : null}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onManagePermissions={openPermissionsDialog}
          />
        </CardContent>
      </Card>

      {/* Add Realtor Dialog */}
      <RealtorDialog
        isOpen={addDialogOpen}
        setIsOpen={setAddDialogOpen}
        onSubmit={handleAddRealtor}
        isLoading={createRealtorMutation.isPending}
        title="Add New Realtor"
      />

      {/* Edit Realtor Dialog */}
      {selectedRealtor && (
        <RealtorDialog
          isOpen={editDialogOpen}
          setIsOpen={setEditDialogOpen}
          onSubmit={handleEditRealtor}
          defaultValues={{
            name: selectedRealtor.name,
            brokerage: selectedRealtor.brokerage,
            license_number: selectedRealtor.license_number || undefined,
            email: selectedRealtor.email || undefined,
            phone: selectedRealtor.phone || undefined,
            website: selectedRealtor.website || undefined,
            bio: selectedRealtor.bio || undefined,
            is_flagged: selectedRealtor.is_flagged,
            notes: selectedRealtor.notes || undefined
          }}
          isLoading={updateRealtorMutation.isPending}
          title="Edit Realtor"
        />
      )}

      {/* Realtor Permissions Dialog */}
      {selectedRealtor && (
        <RealtorPermissionsDialog
          isOpen={permissionsDialogOpen}
          setIsOpen={setPermissionsDialogOpen}
          realtorId={selectedRealtor.id}
          realtorName={selectedRealtor.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the realtor 
              {selectedRealtor && <span className="font-semibold"> {selectedRealtor.name}</span>} 
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRealtor}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRealtorMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RealtorsPage;
