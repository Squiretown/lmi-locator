// FILE: src/lib/api/esri/secure-geocoding.ts
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

/**
 * Secure geocoding function using edge function
 * ✅ FIXED: Now uses invokeEdgeFunction with proper auth header
 */
export const secureGeocodeWithEsri = async (address: string, maxLocations: number = 1) => {
  const { data, error } = await invokeEdgeFunction('secure-esri-geocode', { 
    address, 
    maxLocations 
  });

  if (error) {
    throw new Error(error.message || 'Geocoding failed');
  }

  return data;
};