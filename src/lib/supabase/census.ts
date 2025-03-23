
import { supabase } from "@/integrations/supabase/client";

/**
 * Get cached Census API result for a tract
 * @param tractId Census tract ID
 */
export const getCachedCensusResult = async (tractId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getCachedCensusResult',
        params: { tractId }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving cached Census result:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cache Census API result
 * @param tractId Census tract ID
 * @param data Data to cache
 * @param expiresInDays Number of days until the cache expires
 */
export const cacheCensusResult = async (tractId: string, data: any, expiresInDays: number = 30) => {
  try {
    const { data: responseData, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'cacheCensusResult',
        params: { tractId, data, expiresInDays }
      }
    });

    if (error) throw error;
    return responseData;
  } catch (error) {
    console.error('Error caching Census result:', error);
    return { success: false, error: error.message };
  }
};
