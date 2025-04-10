
// This file now re-exports from the refactored broker module
export type { 
  MortgageBroker, 
  BrokerFormValues 
} from './types';

// Import and re-export from brokers/index.ts instead of circular import
export * from './brokers/index';
