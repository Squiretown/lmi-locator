
import { supabase } from "@/integrations/supabase/client";

/**
 * Save a search to the database
 * @param address The address that was searched
 * @param result The result object returned by the API
 */
export const saveSearch = async (address: string, result: any) => {
  try {
    // Get the current user (if authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'saveSearch',
        params: { address, result, userId }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving search:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get search history
 * @param limit Maximum number of records to return
 */
export const getSearchHistory = async (limit: number = 10) => {
  try {
    // Get the current user (if authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getSearchHistory',
        params: { userId, limit }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving search history:', error);
    return { success: false, error: error.message };
  }
};

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

/**
 * Get popular searches
 * @param limit Maximum number of records to return
 */
export const getPopularSearches = async (limit: number = 5) => {
  try {
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getPopularSearches',
        params: { limit }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving popular searches:', error);
    return { success: false, error: error.message };
  }
};
