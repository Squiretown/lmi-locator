import { supabase } from '@/integrations/supabase/client';

/**
 * Secure reverse geocoding function using edge function
 */
export const secureReverseGeocodeWithEsri = async (lat: number, lon: number) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase.functions.invoke('secure-esri-reverse-geocode', {
    body: { lat, lon },
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    throw new Error(error.message || 'Reverse geocoding failed');
  }

  return data;
};