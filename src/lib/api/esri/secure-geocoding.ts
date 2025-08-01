import { supabase } from '@/integrations/supabase/client';

/**
 * Secure geocoding function using edge function
 */
export const secureGeocodeWithEsri = async (address: string, maxLocations: number = 1) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase.functions.invoke('secure-esri-geocode', {
    body: { address, maxLocations },
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    throw new Error(error.message || 'Geocoding failed');
  }

  return data;
};