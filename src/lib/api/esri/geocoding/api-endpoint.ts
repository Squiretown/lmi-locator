// DEPRECATED: Direct API access with API key
// Use secure-geocoding.ts for secure API access through edge functions

import { GeocodeApproachResult } from './types';

/**
 * @deprecated Use secureGeocodeWithEsri instead
 */
export async function tryApiEndpoint(address: string): Promise<GeocodeApproachResult | null> {
  throw new Error('Direct API access is deprecated. Use secureGeocodeWithEsri instead.');
}