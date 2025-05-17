
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
    console.log('Fetching dashboard statistics...');
    
    // Use the census-db edge function to get dashboard stats
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getDashboardStats',
        params: {}
      }
    });
    
    if (error) {
      console.error('Error invoking edge function:', error);
      throw new Error(error.message || 'Failed to load dashboard statistics');
    }
    
    // If the edge function returned an error
    if (data && data.success === false) {
      console.error('Edge function returned error:', data.error);
      throw new Error(data.error || 'Failed to retrieve dashboard data');
    }
    
    console.log('Dashboard stats retrieved successfully:', data);
    
    // Return the dashboard stats
    return {
      userCount: data?.userCount || 0, 
      propertyCount: data?.propertyCount || 0, 
      realtorCount: data?.realtorCount || 0, 
      searchHistory: data?.searchHistory || [],
      success: true,
      timestamp: data?.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Exception in getDashboardStats:', error);
    
    // Return error information
    return { 
      userCount: 0, 
      propertyCount: 0, 
      realtorCount: 0, 
      searchHistory: [],
      success: false, 
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }
};
