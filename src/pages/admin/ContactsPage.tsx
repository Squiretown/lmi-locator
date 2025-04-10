
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserPlus, Search, ArrowLeft } from 'lucide-react';
import { Contact, ContactFormValues } from '@/lib/api/types';
import ContactTable from '@/components/contacts/ContactTable';
import ContactDialog from '@/components/contacts/ContactDialog';
import { useContacts } from '@/hooks/useContacts';
import { Link } from 'react-router-dom';

const ContactsPage: React.FC = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { toast } = useToast();
  
  const { 
    contacts, 
    isLoadingContacts, 
    createContact, 
    updateContact, 
    deleteContact 
  } = useContacts(professionalId);

  const handleCreateContact = async (data: ContactFormValues) => {
    if (!professionalId) {
      toast({
        title: 'Error',
        description: 'No professional ID provided',
        variant: 'destructive'
      });
      return;
    }
    
    await createContact({ professionalId, contact: data });
    setAddDialogOpen(false);
  };

  const handleUpdateContact = async (data: ContactFormValues) => {
    if (!selectedContact) return;
    
    await updateContact({ id: selectedContact.id, contact: data });
    setEditDialogOpen(false);
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    
    await deleteContact(selectedContact.id);
    setDeleteDialogOpen(false);
  };

  const openEditDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || 
           (contact.email && contact.email.toLowerCase().includes(query)) ||
           (contact.phone && contact.phone.toLowerCase().includes(query));
  });

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <Link to="/admin/professionals" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Professionals
        </Link>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Contacts</h2>
              <p className="text-muted-foreground">Manage contacts for this professional</p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Contact
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoadingContacts ? (
            <div className="py-10 text-center">Loading contacts...</div>
          ) : (
            <ContactTable
              contacts={filteredContacts}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          )}
        </CardContent>
      </Card>

      <ContactDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleCreateContact}
        isEditMode={false}
        title="Add New Contact"
      />

      {selectedContact && (
        <ContactDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleUpdateContact}
          isEditMode={true}
          initialValues={selectedContact}
          title="Edit Contact"
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact 
              {selectedContact && <span className="font-semibold"> {selectedContact.firstName} {selectedContact.lastName}</span>} 
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteContact}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactsPage;
