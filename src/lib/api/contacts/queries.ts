
import { supabase } from '@/integrations/supabase/client';
import { ContactTable, ContactInteractionTable } from '../database-types';
import { Contact, ContactInteraction } from '../types';
import { transformContact, transformInteraction } from '../utils/transformers';

export const fetchContacts = async (professionalId: string): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select()
    .eq('owner_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts:', error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  const contacts = (data || []).map((item: any) => transformContact(item as ContactTable));
  return contacts;
};

export const fetchContactById = async (id: string): Promise<Contact | null> => {
  const { data, error } = await supabase
    .from('contacts')
    .select()
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

export const fetchContactInteractions = async (contactId: string): Promise<ContactInteraction[]> => {
  const { data, error } = await supabase
    .from('contact_interactions')
    .select()
    .eq('contact_id', contactId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching contact interactions:', error);
    throw new Error(`Failed to fetch interactions: ${error.message}`);
  }

  const interactions = (data || []).map((item: any) => transformInteraction(item as ContactInteractionTable));
  return interactions;
};
