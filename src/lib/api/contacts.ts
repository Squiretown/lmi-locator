
// This file now re-exports from the refactored modules
export { 
  Contact, 
  ContactFormValues, 
  ContactInteraction, 
  ContactInteractionFormValues 
} from './types';

export {
  fetchContacts,
  fetchContactById,
  fetchContactInteractions,
  createContact,
  updateContact,
  deleteContact,
  createContactInteraction,
  deleteContactInteraction
} from './contacts';
