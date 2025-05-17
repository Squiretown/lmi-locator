
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Handle API requests and route to the appropriate function
export async function handleApiRequest(supabase: SupabaseClient, action: string, params: any = {}) {
  console.log(`Handling API request: action=${action}`);
  
  try {
    switch (action) {
      case 'getDashboardStats':
        return await handleGetDashboardStats(supabase);
      case 'searchByAddress':
        return await handleSearchByAddress(supabase, params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error handling API request for action ${action}:`, error);
    return {
      success: false,
      error: error.message || `Unknown error processing ${action} action`,
      timestamp: new Date().toISOString()
    };
  }
}

// Handle dashboard stats request
async function handleGetDashboardStats(supabase: SupabaseClient) {
  console.log("Fetching dashboard statistics");
  
  // Initialize response object with default values
  const response = {
    userCount: 0,
    propertyCount: 0,
    realtorCount: 0,
    searchHistory: [],
    success: true,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Get user count
    try {
      const { count: userCount, error: userError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) {
        console.error("Error fetching user count:", userError);
        // Continue execution, set default value
        response.userCount = 0;
      } else {
        response.userCount = userCount || 0;
      }
    } catch (userCountError) {
      console.error("Exception fetching user count:", userCountError);
      response.userCount = 0;
    }
    
    // Get property count 
    try {
      const { count: propertyCount, error: propertyError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      
      if (propertyError) {
        if (propertyError.code === 'PGRST116') {
          console.log("Properties table doesn't exist yet, using default value");
        } else {
          console.error("Error fetching property count:", propertyError);
        }
        response.propertyCount = 0;
      } else {
        response.propertyCount = propertyCount || 0;
      }
    } catch (propError) {
      console.error("Exception fetching property count:", propError);
      response.propertyCount = 0;
    }
    
    // Get realtor count
    try {
      const { count: realtorCount, error: realtorError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'realtor');
      
      if (realtorError) {
        console.error("Error fetching realtor count:", realtorError);
        response.realtorCount = 0;
      } else {
        response.realtorCount = realtorCount || 0;
      }
    } catch (realtorCountError) {
      console.error("Exception fetching realtor count:", realtorCountError);
      response.realtorCount = 0;
    }
    
    // Get search history
    try {
      const { data: searchHistory, error: searchError } = await supabase
        .from('search_history')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(10);
      
      if (searchError) {
        if (searchError.code === 'PGRST116') {
          console.log("Search history table doesn't exist yet, using default value");
        } else {
          console.error("Error fetching search history:", searchError);
        }
        response.searchHistory = [];
      } else {
        response.searchHistory = searchHistory || [];
      }
    } catch (searchHistoryError) {
      console.error("Exception fetching search history:", searchHistoryError);
      response.searchHistory = [];
    }
    
    // Return the dashboard stats
    return response;
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return {
      userCount: 0,
      propertyCount: 0,
      realtorCount: 0,
      searchHistory: [],
      success: false,
      error: error.message || "Unknown error in getDashboardStats",
      timestamp: new Date().toISOString()
    };
  }
}

// Handle search by address
async function handleSearchByAddress(supabase: SupabaseClient, params: any) {
  try {
    const { address } = params;
    
    if (!address) {
      throw new Error("Address is required");
    }
    
    console.log(`Searching for address: ${address}`);
    
    // Implement your search logic here
    // For now, we'll return a placeholder response
    return {
      success: true,
      results: [],
      message: "Search function is being implemented"
    };
  } catch (error) {
    console.error("Error in searchByAddress:", error);
    return {
      success: false,
      error: error.message || "Unknown error in searchByAddress"
    };
  }
}
