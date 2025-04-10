
import { supabase } from '@/integrations/supabase/client';
import { ContactTable, ContactInteractionTable } from '../database-types';
import { Contact, ContactFormValues, ContactInteraction, ContactInteractionFormValues } from '../types';
import { transformContact, transformInteraction } from '../utils/transformers';

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
