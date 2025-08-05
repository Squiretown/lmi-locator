
// This file now re-exports from the mortgage professionals API for backward compatibility
export type { 
  MortgageProfessional as MortgageBroker, 
  MortgageProfessionalFormValues as BrokerFormValues 
} from './mortgage-professionals';

// Import and re-export from mortgage-professionals/index.ts 
export * from './mortgage-professionals/index';
