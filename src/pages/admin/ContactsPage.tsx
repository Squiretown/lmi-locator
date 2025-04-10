
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Contact, ContactFormValues } from '@/lib/api/types';
import { useContacts } from '@/hooks/useContacts';

// Import our new components
import ContactsPageHeader from '@/components/contacts/ContactsPageHeader';
import ContactsSearch from '@/components/contacts/ContactsSearch';
import ContactsSection from '@/components/contacts/ContactsSection';
import ContactDialog from '@/components/contacts/ContactDialog';
import DeleteContactDialog from '@/components/contacts/DeleteContactDialog';

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

  const openDeleteDialog = (id: string) => {
    // Find the contact with the given id
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      setSelectedContact(contact);
      setDeleteDialogOpen(true);
    }
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
      <ContactsPageHeader onAddNewContact={() => setAddDialogOpen(true)} />
      
      <Card>
        <CardContent className="p-6">
          <ContactsSearch 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
          />

          <ContactsSection
            contacts={filteredContacts}
            isLoading={isLoadingContacts}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
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

      <DeleteContactDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDeleteContact}
        contact={selectedContact}
      />
    </div>
  );
};

export default ContactsPage;
