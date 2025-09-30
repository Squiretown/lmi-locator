import { supabase } from '@/integrations/supabase/client';

/**
 * Secure reverse geocoding function using edge function
 * Supabase SDK automatically handles authentication
 */
export const secureReverseGeocodeWithEsri = async (lat: number, lon: number) => {
  const { data, error } = await supabase.functions.invoke('secure-esri-reverse-geocode', {
    body: { lat, lon }
  });

  if (error) {
    throw new Error(error.message || 'Reverse geocoding failed');
  }

  return data;
};