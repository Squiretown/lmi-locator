
// This file now re-exports from the refactored modules
export type { 
  Contact, 
  ContactFormValues, 
  ContactInteraction, 
  ContactInteractionFormValues 
} from './types';

// Import and re-export from contacts/index.ts instead of circular import
export * from './contacts/index';
