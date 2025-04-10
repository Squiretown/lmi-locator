
// This file now re-exports from the refactored modules
export type { 
  Professional, 
  ProfessionalFormValues 
} from './types';

// Import and re-export from professionals/index.ts instead of circular import
export * from './professionals/index';
