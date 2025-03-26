
// ESRI API Service - Main entry point
// Re-exports all functionality

// Re-export interfaces and types
export * from './interfaces';

// Re-export constants
export * from './constants';

// Re-export geocoding functionality
export * from './geocoding';

// Re-export LMI services
export * from './lmi-services';

// Re-export utility functions
export * from './utils';

// Export a default object with all the functions for backward compatibility
import * as geocoding from './geocoding';
import * as lmiServices from './lmi-services';
import * as utils from './utils';

export default {
  ...geocoding,
  ...lmiServices,
  ...utils
};
