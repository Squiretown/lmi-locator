
// Main entry point for the LMI API module
// Re-exports all functionality

// Re-export types
export type { LmiResult, LmiCheckOptions } from './types';

// Re-export core API functions
export { 
  checkLmiStatus,
  checkHudLmiStatus,
  checkHudLmiStatusByPlace,
  checkEnhancedLmiStatus
} from './api-functions';

// Re-export mock data function for testing
export { getMockResponse } from './mock-data';
