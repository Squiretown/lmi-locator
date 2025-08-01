// DEPRECATED: Direct API access with API key
// Use secure-reverse-geocoding.ts for secure API access through edge functions

import { secureReverseGeocodeWithEsri } from './secure-reverse-geocoding';

/**
 * @deprecated Use secureReverseGeocodeWithEsri instead for secure API access
 */
export const reverseGeocodeWithEsri = async (lat: number, lon: number): Promise<{
  address: string;
  city?: string;
  state?: string;
  zip?: string;
}> => {
  return await secureReverseGeocodeWithEsri(lat, lon);
};