// DEPRECATED: Direct API access with API key
// Use secure-geocoding.ts for secure API access through edge functions

import { AddressComponents } from '../interfaces';

/**
 * @deprecated Use secureGeocodeWithEsri instead
 */
export const geocodeAddressWithEsri = async (address: string | AddressComponents): Promise<any> => {
  throw new Error('Direct API access is deprecated. Use secureGeocodeWithEsri instead.');
};

// Re-export helper functions from other geocoding modules
export * from './standard-endpoint';
export * from './api-endpoint';
export * from './single-line';
export * from './parsed-components';
export * from './auth-header';
export * from './types';