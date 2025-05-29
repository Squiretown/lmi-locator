import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchRealtors, Realtor, RealtorFormValues } from '@/lib/api/realtors';
import RealtorDialog from '@/components/realtors/RealtorDialog';
import { InviteRealtorDialog } from '@/components/realtors/InviteRealtorDialog';
import { RealtorsPageHeader } from '@/components/realtors/RealtorsPageHeader';
import { RealtorsSearch } from '@/components/realtors/RealtorsSearch';
import { RealtorsTable } from '@/components/realtors/RealtorsTable';
import { DeleteRealtorDialog } from '@/components/realtors/DeleteRealtorDialog';
import { useRealtorOperations } from '@/hooks/useRealtorOperations';

const RealtorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedRealtor, setSelectedRealtor] = useState<Realtor | null>(null);
  
  const { data: realtors, isLoading, error } = useQuery({
    queryKey: ['realtors'],
    queryFn: fetchRealtors,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
  });

  const {
    createRealtorMutation,
    updateRealtorMutation,
    deleteRealtorMutation,
  } = useRealtorOperations();

  const handleAddRealtor = async (data: RealtorFormValues) => {
    try {
      await createRealtorMutation.mutateAsync(data);
      setAddDialogOpen(false);
      console.log('Realtor added successfully');
    } catch (error) {
      console.error('Failed to add realtor:', error);
    }
  };

  const handleEditRealtor = async (data: RealtorFormValues) => {
    if (!selectedRealtor) return;
    try {
      await updateRealtorMutation.mutateAsync({ id: selectedRealtor.id, data });
      setEditDialogOpen(false);
      setSelectedRealtor(null);
      console.log('Realtor updated successfully');
    } catch (error) {
      console.error('Failed to update realtor:', error);
    }
  };

  const handleDeleteRealtor = async () => {
    if (!selectedRealtor) return;
    try {
      console.log('Attempting to delete realtor:', selectedRealtor.id);
      await deleteRealtorMutation.mutateAsync(selectedRealtor.id);
      setDeleteDialogOpen(false);
      setSelectedRealtor(null);
      console.log('Delete operation completed - UI should refresh');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const openEditDialog = (realtor: Realtor) => {
    setSelectedRealtor(realtor);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (realtor: Realtor) => {
    setSelectedRealtor(realtor);
    setDeleteDialogOpen(true);
  };

  const filteredRealtors = realtors?.filter(realtor => 
    realtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    realtor.brokerage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    realtor.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    realtor.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-6">
          <RealtorsPageHeader
            onInviteClick={() => setInviteDialogOpen(true)}
            onAddClick={() => setAddDialogOpen(true)}
          />

          <RealtorsSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <RealtorsTable
            realtors={filteredRealtors}
            isLoading={isLoading}
            error={error}
            onEditRealtor={openEditDialog}
            onDeleteRealtor={openDeleteDialog}
          />
        </CardContent>
      </Card>

      <RealtorDialog
        isOpen={addDialogOpen}
        setIsOpen={setAddDialogOpen}
        onSubmit={handleAddRealtor}
        isLoading={createRealtorMutation.isPending}
        title="Add New Realtor"
      />

      {selectedRealtor && (
        <RealtorDialog
          isOpen={editDialogOpen}
          setIsOpen={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedRealtor(null);
          }}
          onSubmit={handleEditRealtor}
          defaultValues={selectedRealtor}
          isLoading={updateRealtorMutation.isPending}
          title="Edit Realtor"
        />
      )}

      <DeleteRealtorDialog
        isOpen={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedRealtor(null);
        }}
        realtor={selectedRealtor}
        onConfirm={handleDeleteRealtor}
        isDeleting={deleteRealtorMutation.isPending}
      />

      <InviteRealtorDialog
        isOpen={inviteDialogOpen}
        setIsOpen={setInviteDialogOpen}
      />
    </div>
  );
};

export default RealtorsPage;
