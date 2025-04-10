
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { 
  fetchContacts, 
  fetchContactById,
  createContact, 
  updateContact, 
  deleteContact,
  fetchContactInteractions,
  createContactInteraction,
  deleteContactInteraction
} from '@/lib/api/contacts';
import type { Contact, ContactFormValues, ContactInteraction, ContactInteractionFormValues } from '@/lib/api/types';

/**
 * Custom hook for managing contact data and operations
 */
export function useContacts(professionalId?: string) {
  const queryClient = useQueryClient();

  // Query for fetching all contacts for a professional
  const { 
    data: contacts = [],
    isLoading: isLoadingContacts,
    error: contactsError,
    refetch: refetchContacts
  } = useQuery({
    queryKey: ['contacts', professionalId],
    queryFn: () => professionalId ? fetchContacts(professionalId) : Promise.resolve([]),
    enabled: !!professionalId
  });

  // Query for fetching a single contact
  const getContactByIdQuery = (contactId: string) => useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => fetchContactById(contactId),
    enabled: !!contactId,
  });

  // Query for fetching contact interactions
  const getContactInteractionsQuery = (contactId: string) => useQuery({
    queryKey: ['contact-interactions', contactId],
    queryFn: () => fetchContactInteractions(contactId),
    enabled: !!contactId,
  });

  // Mutation for creating a new contact
  const { mutateAsync: createContactMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: { professionalId: string; contact: ContactFormValues }) => 
      createContact(data.professionalId, data.contact),
    onSuccess: () => {
      toast.success('Contact created successfully');
      if (professionalId) {
        queryClient.invalidateQueries({ queryKey: ['contacts', professionalId] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to create contact: ${error.message}`);
    }
  });

  // Mutation for updating an existing contact
  const { mutateAsync: updateContactMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, contact }: { id: string; contact: ContactFormValues }) => 
      updateContact(id, contact),
    onSuccess: () => {
      toast.success('Contact updated successfully');
      if (professionalId) {
        queryClient.invalidateQueries({ queryKey: ['contacts', professionalId] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update contact: ${error.message}`);
    }
  });

  // Mutation for deleting a contact
  const { mutateAsync: deleteContactMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      toast.success('Contact deleted successfully');
      if (professionalId) {
        queryClient.invalidateQueries({ queryKey: ['contacts', professionalId] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    }
  });

  // Mutation for creating a contact interaction
  const { mutateAsync: createInteractionMutation, isPending: isCreatingInteraction } = useMutation({
    mutationFn: ({ contactId, interaction }: { contactId: string; interaction: ContactInteractionFormValues }) => 
      createContactInteraction(contactId, interaction),
    onSuccess: (_, { contactId }) => {
      toast.success('Interaction added successfully');
      queryClient.invalidateQueries({ queryKey: ['contact-interactions', contactId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add interaction: ${error.message}`);
    }
  });

  // Mutation for deleting a contact interaction
  const { mutateAsync: deleteInteractionMutation, isPending: isDeletingInteraction } = useMutation({
    mutationFn: (id: string) => deleteContactInteraction(id),
    onSuccess: () => {
      toast.success('Interaction deleted successfully');
      // Note: We need to invalidate the specific contact's interactions, but we don't have the contactId here
      // This will be handled in the component by manually refetching
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete interaction: ${error.message}`);
    }
  });

  return {
    // Data
    contacts,
    
    // Loading states
    isLoadingContacts,
    isCreating,
    isUpdating,
    isDeleting,
    isCreatingInteraction,
    isDeletingInteraction,
    
    // Error states
    contactsError,
    
    // Contact Methods
    createContact: createContactMutation,
    updateContact: updateContactMutation,
    deleteContact: deleteContactMutation,
    refetchContacts,
    getContactByIdQuery,
    
    // Interaction Methods
    getContactInteractionsQuery,
    createInteraction: createInteractionMutation,
    deleteInteraction: deleteInteractionMutation
  };
}
