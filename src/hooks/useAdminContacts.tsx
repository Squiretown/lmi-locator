
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import type { Contact, ContactFormValues } from '@/lib/api/types';

/**
 * Custom hook for admin contact management across all professionals
 */
export function useAdminContacts() {
  const queryClient = useQueryClient();

  // Query for fetching all contacts (admin view)
  const { 
    data: contacts = [],
    isLoading: isLoadingContacts,
    error: contactsError,
    refetch: refetchContacts
  } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async (): Promise<Contact[]> => {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          professionals!inner(
            name,
            professional_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin contacts:', error);
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        phone: item.phone,
        address: item.address,
        notes: item.notes,
        status: item.status,
        customFields: item.custom_fields || {},
        createdAt: item.created_at,
        lastUpdated: item.last_updated,
        ownerId: item.owner_id,
        ownerName: item.professionals?.name,
        ownerType: item.professionals?.professional_type
      }));
    }
  });

  // Mutation for creating a new contact
  const { mutateAsync: createContact, isPending: isCreating } = useMutation({
    mutationFn: async (data: ContactFormValues & { professionalId: string }) => {
      const contactData = {
        owner_id: data.professionalId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        status: data.status,
        custom_fields: data.customFields || null
      };

      const { data: result, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw new Error(`Failed to create contact: ${error.message}`);
      }

      return result;
    },
    onSuccess: () => {
      toast.success('Contact created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create contact: ${error.message}`);
    }
  });

  // Mutation for updating an existing contact
  const { mutateAsync: updateContact, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, contact }: { id: string; contact: ContactFormValues }) => {
      const contactData = {
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email || null,
        phone: contact.phone || null,
        address: contact.address || null,
        notes: contact.notes || null,
        status: contact.status,
        custom_fields: contact.customFields || null
      };

      const { data, error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        throw new Error(`Failed to update contact: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Contact updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update contact: ${error.message}`);
    }
  });

  // Mutation for deleting a contact
  const { mutateAsync: deleteContact, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error);
        throw new Error(`Failed to delete contact: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast.success('Contact deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    }
  });

  // Mutation for deleting multiple contacts
  const { mutateAsync: deleteMultipleContacts, isPending: isDeletingMultiple } = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('Error deleting contacts:', error);
        throw new Error(`Failed to delete contacts: ${error.message}`);
      }
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} contacts deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete contacts: ${error.message}`);
    }
  });

  // Function to export contacts
  const exportContacts = async (contactsToExport: Contact[]) => {
    try {
      const csvData = contactsToExport.map(contact => ({
        'First Name': contact.firstName,
        'Last Name': contact.lastName,
        'Email': contact.email || '',
        'Phone': contact.phone || '',
        'Address': contact.address || '',
        'Status': contact.status,
        'Notes': contact.notes || '',
        'Owner': '',
        'Owner Type': '',
        'Created At': new Date(contact.createdAt || '').toLocaleDateString()
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${contactsToExport.length} contacts`);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast.error('Failed to export contacts');
    }
  };

  return {
    // Data
    contacts,
    
    // Loading states
    isLoadingContacts,
    isCreating,
    isUpdating,
    isDeleting,
    isDeletingMultiple,
    
    // Error states
    contactsError,
    
    // Methods
    createContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    exportContacts,
    refetchContacts
  };
}
