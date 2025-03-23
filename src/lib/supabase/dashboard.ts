
import { supabase } from "@/integrations/supabase/client";

/**
 * Retrieves dashboard statistics from the database using an edge function
 * 
 * @returns {Promise<Object>} Object containing:
 *   - searchHistory: Recent property searches
 *   - userCount: Total number of registered users
 *   - propertyCount: Total number of properties in database
 *   - realtorCount: Total number of realtors in database
 *   - success: false if there was an error
 *   - error: Error message if there was an error
 */
export const getDashboardStats = async () => {
  try {
    // Use the census-db edge function instead of direct database queries
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getDashboardStats',
        params: {}
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    return { success: false, error: error.message };
  }
};
