import { supabase } from '@/integrations/supabase/client';
import { getValidSession } from '@/lib/auth/getValidSession';

/**
 * Secure geocoding function using edge function
 */
export const secureGeocodeWithEsri = async (address: string, maxLocations: number = 1) => {
  await getValidSession();

  const { data, error } = await supabase.functions.invoke('secure-esri-geocode', {
    body: { address, maxLocations }
  });

  if (error) {
    throw new Error(error.message || 'Geocoding failed');
  }

  return data;
};