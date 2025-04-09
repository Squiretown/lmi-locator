
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    // Use the census-db edge function to get dashboard stats
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getDashboardStats',
        params: {}
      }
    });
    
    if (error) {
      console.error('Error in edge function:', error);
      toast.error('Failed to load dashboard statistics');
      throw error;
    }
    
    // If the edge function returned an error
    if (data && data.success === false) {
      console.error('Edge function error:', data.error);
      toast.error('Failed to retrieve dashboard data');
      return { 
        userCount: 0, 
        propertyCount: 0, 
        realtorCount: 0, 
        searchHistory: [],
        success: false,
        error: data.error
      };
    }
    
    // Return the dashboard stats
    return data || { 
      userCount: 0, 
      propertyCount: 0, 
      realtorCount: 0, 
      searchHistory: [] 
    };
  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    toast.error('Error loading dashboard data');
    
    return { 
      userCount: 0, 
      propertyCount: 0, 
      realtorCount: 0, 
      searchHistory: [],
      success: false, 
      error: error.message || 'Unknown error occurred'
    };
  }
};
