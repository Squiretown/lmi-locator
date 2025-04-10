
import { supabase } from '@/integrations/supabase/client';
import { ContactTable, ContactInteractionTable } from './database-types';

export interface Contact {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'lead' | 'client';
  createdAt: string;
  lastUpdated: string;
  customFields: any | null;
}

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'lead' | 'client';
  customFields?: any;
}

export interface ContactInteraction {
  id: string;
  contactId: string;
  userId: string;
  type: 'note' | 'call' | 'email' | 'property_check';
  timestamp: string;
  description: string | null;
  metadata: any | null;
}

export interface ContactInteractionFormValues {
  type: 'note' | 'call' | 'email' | 'property_check';
  description?: string;
  metadata?: any;
}

// Transform database object to Contact interface
const transformContact = (item: ContactTable): Contact => ({
  id: item.id,
  ownerId: item.owner_id,
  firstName: item.first_name,
  lastName: item.last_name,
  email: item.email,
  phone: item.phone,
  address: item.address,
  notes: item.notes,
  status: item.status,
  createdAt: item.created_at,
  lastUpdated: item.last_updated,
  customFields: item.custom_fields
});

// Transform database object to ContactInteraction interface
const transformInteraction = (item: ContactInteractionTable): ContactInteraction => ({
  id: item.id,
  contactId: item.contact_id,
  userId: item.user_id,
  type: item.type,
  timestamp: item.timestamp,
  description: item.description,
  metadata: item.metadata
});

export const fetchContacts = async (professionalId: string): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('owner_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts:', error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  const contacts = (data || []).map((item: ContactTable) => transformContact(item));
  return contacts;
};

export const fetchContactById = async (id: string): Promise<Contact | null> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No record found, return null
      return null;
    }
    console.error('Error fetching contact:', error);
    throw new Error(`Failed to fetch contact: ${error.message}`);
  }

  return transformContact(data as ContactTable);
};

export const createContact = async (professionalId: string, contact: ContactFormValues): Promise<Contact> => {
  try {
    // Prepare the contact data
    const contactData = {
      owner_id: professionalId,
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
      .insert([contactData])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw new Error(`Failed to create contact: ${error.message}`);
    }

    return transformContact(data as ContactTable);
  } catch (err) {
    console.error('Error in createContact:', err);
    throw err;
  }
};

export const updateContact = async (id: string, contact: ContactFormValues): Promise<Contact> => {
  // Prepare the contact data
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

  return transformContact(data as ContactTable);
};

export const deleteContact = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact:', error);
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
};

// Contact Interactions
export const fetchContactInteractions = async (contactId: string): Promise<ContactInteraction[]> => {
  const { data, error } = await supabase
    .from('contact_interactions')
    .select('*')
    .eq('contact_id', contactId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching contact interactions:', error);
    throw new Error(`Failed to fetch interactions: ${error.message}`);
  }

  const interactions = (data || []).map((item: ContactInteractionTable) => transformInteraction(item));
  return interactions;
};

export const createContactInteraction = async (
  contactId: string, 
  interaction: ContactInteractionFormValues
): Promise<ContactInteraction> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      throw new Error(`Authentication required: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('User must be authenticated to create interactions');
    }

    // Prepare the interaction data
    const interactionData = {
      contact_id: contactId,
      user_id: user.id,
      type: interaction.type,
      description: interaction.description || null,
      metadata: interaction.metadata || null
    };

    const { data, error } = await supabase
      .from('contact_interactions')
      .insert([interactionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating interaction:', error);
      throw new Error(`Failed to create interaction: ${error.message}`);
    }

    return transformInteraction(data as ContactInteractionTable);
  } catch (err) {
    console.error('Error in createContactInteraction:', err);
    throw err;
  }
};

export const deleteContactInteraction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contact_interactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting interaction:', error);
    throw new Error(`Failed to delete interaction: ${error.message}`);
  }
};
