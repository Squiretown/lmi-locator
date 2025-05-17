
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Handle API requests and route to the appropriate function
export async function handleApiRequest(supabase: SupabaseClient, action: string, params: any = {}) {
  console.log(`Handling API request: action=${action}`);
  
  switch (action) {
    case 'getDashboardStats':
      return await handleGetDashboardStats(supabase);
    case 'searchByAddress':
      return await handleSearchByAddress(supabase, params);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// Handle dashboard stats request
async function handleGetDashboardStats(supabase: SupabaseClient) {
  try {
    console.log("Fetching dashboard statistics");
    
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (userError) {
      console.error("Error fetching user count:", userError);
      throw userError;
    }
    
    // Get property count 
    // Note: Assuming 'properties' table exists, replace with actual table if different
    const { count: propertyCount, error: propertyError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    // If the properties table doesn't exist yet, we'll use a placeholder value
    if (propertyError && propertyError.code !== 'PGRST116') { // Not a "relation does not exist" error
      console.error("Error fetching property count:", propertyError);
      // Continue execution, don't throw
    }
    
    // Get realtor count
    const { count: realtorCount, error: realtorError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'realtor');
    
    if (realtorError && realtorError.code !== 'PGRST116') {
      console.error("Error fetching realtor count:", realtorError);
      // Continue execution, don't throw
    }
    
    // Get search history
    const { data: searchHistory, error: searchError } = await supabase
      .from('search_history')
      .select('*')
      .order('searched_at', { ascending: false })
      .limit(10);
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error("Error fetching search history:", searchError);
      // Continue execution, don't throw
    }
    
    // Return the dashboard stats
    return {
      userCount: userCount || 0,
      propertyCount: propertyCount || 0,
      realtorCount: realtorCount || 0,
      searchHistory: searchHistory || [],
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return {
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
