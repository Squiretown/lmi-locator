import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRealtors, createRealtor, updateRealtor, deleteRealtor, Realtor, RealtorFormValues } from '@/lib/api/realtors';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import RealtorDialog from '@/components/realtors/RealtorDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { UserPlus, Search, Pencil, Trash2, Mail } from 'lucide-react';
import { InviteRealtorDialog } from '@/components/realtors/InviteRealtorDialog';

const RealtorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedRealtor, setSelectedRealtor] = useState<Realtor | null>(null);
  
  const queryClient = useQueryClient();

  const { data: realtors, isLoading, error } = useQuery({
    queryKey: ['realtors'],
    queryFn: fetchRealtors
  });

  const createRealtorMutation = useMutation({
    mutationFn: createRealtor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realtors'] });
      toast.success('Realtor added successfully');
      setAddDialogOpen(false);
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
      setEditDialogOpen(false);
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
      setDeleteDialogOpen(false);
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
  );

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Realtors</h2>
              <p className="text-muted-foreground">Manage real estate agents in the system</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setInviteDialogOpen(true)} variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Invite Realtor
              </Button>
              <Button onClick={() => setAddDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Realtor
              </Button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search realtors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="py-10 text-center">Loading realtors...</div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">
              Error loading realtors: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Brokerage</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRealtors?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No realtors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRealtors?.map((realtor) => (
                      <TableRow key={realtor.id}>
                        <TableCell className="font-medium">{realtor.name}</TableCell>
                        <TableCell>{realtor.email}</TableCell>
                        <TableCell>{realtor.brokerage}</TableCell>
                        <TableCell>{realtor.license_number}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            realtor.status === 'active' ? 'bg-green-100 text-green-800' :
                            realtor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {realtor.status.charAt(0).toUpperCase() + realtor.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(realtor)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDeleteDialog(realtor)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6}>
                      Total: {filteredRealtors?.length || 0} realtors
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
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
          setIsOpen={setEditDialogOpen}
          onSubmit={handleEditRealtor}
          defaultValues={selectedRealtor}
          isLoading={updateRealtorMutation.isPending}
          title="Edit Realtor"
        />
      )}

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

      <InviteRealtorDialog
        isOpen={inviteDialogOpen}
        setIsOpen={setInviteDialogOpen}
      />
    </div>
  );
};

export default RealtorsPage;
