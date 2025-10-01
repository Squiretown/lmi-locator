// FILE: src/lib/api/esri/secure-reverse-geocoding.ts
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

/**
 * Secure reverse geocoding function using edge function
 * ✅ FIXED: Now uses invokeEdgeFunction with proper auth header
 */
export const secureReverseGeocodeWithEsri = async (lat: number, lon: number) => {
  const { data, error } = await invokeEdgeFunction('secure-esri-reverse-geocode', { 
    lat, 
    lon 
  });

  if (error) {
    throw new Error(error.message || 'Reverse geocoding failed');
  }

  return data;
};