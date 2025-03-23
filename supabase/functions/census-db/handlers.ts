
// Import any dependencies
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { CENSUS_API_BASE_URL, ACS_DATASET, MEDIAN_INCOME_VARIABLE } from "../lmi-check/constants.ts";

export async function handleApiRequest(supabase: SupabaseClient, action: string, params: any) {
  console.log(`Handling API request for action: ${action}`);
  
  switch (action) {
    case 'getMedianIncome':
      return await getMedianIncome(params);
    case "saveSearch":
      return await saveSearch(supabase, params.address, params.result, params.userId);
    case "getSearchHistory":
      return await getSearchHistory(supabase, params.userId, params.limit);
    case "cacheCensusResult":
      return await cacheCensusResult(supabase, params.tractId, params.data, params.expiresInDays);
    case "getCachedCensusResult":
      return await getCachedCensusResult(supabase, params.tractId);
    case "getPopularSearches":
      return await getPopularSearches(supabase, params.limit);
    case "getDashboardStats":
      return await getDashboardStats(supabase);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// Function to get median income for a census tract
async function getMedianIncome(params: { geoid: string, state: string, county: string, tract: string }) {
  console.log('Getting median income for tract:', params.geoid);
  
  try {
    // Get Census API Key from environment
    const CENSUS_API_KEY = Deno.env.get("CENSUS_API_KEY");
    
    if (!CENSUS_API_KEY) {
      console.warn('Census API key not found in environment variables');
      throw new Error('Census API key not configured');
    }
    
    const { state, county, tract } = params;
    
    // Create URL for ACS API request
    const apiUrl = `${CENSUS_API_BASE_URL}/${ACS_DATASET}?get=${MEDIAN_INCOME_VARIABLE}&for=tract:${tract}&in=state:${state}%20county:${county}&key=${CENSUS_API_KEY}`;
    
    console.log(`Making request to Census ACS API`);
    
    // Make the API request
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Census API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Census API returns a 2D array with headers in the first row and data in subsequent rows
    if (data.length < 2) {
      throw new Error('Invalid response from Census API');
    }
    
    // Extract the median income value from the response
    const medianIncome = parseInt(data[1][0]);
    
    return {
      success: true,
      medianIncome
    };
  } catch (error) {
    console.error('Error fetching median income from Census API:', error);
    
    // Return error response
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

// Add the getDashboardStats function if it doesn't exist
async function getDashboardStats(supabase: SupabaseClient) {
  try {
    console.log('Retrieving dashboard statistics');
    
    // Fetch search history
    const { data: searchHistory, error: searchError } = await supabase
      .from('search_history')
      .select('*')
      .order('searched_at', { ascending: false })
      .limit(10);
    
    if (searchError) throw searchError;
    
    // Fetch user count
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (userError) throw userError;
    
    // Fetch property count
    const { count: propertyCount, error: propertyError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    if (propertyError) throw propertyError;
    
    // Fetch realtor count
    const { count: realtorCount, error: realtorError } = await supabase
      .from('realtors')
      .select('*', { count: 'exact', head: true });
    
    if (realtorError) throw realtorError;
    
    return {
      success: true,
      searchHistory,
      userCount,
      propertyCount,
      realtorCount
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return { success: false, error: error.message };
  }
}

// Function to get popular searches
async function getPopularSearches(supabase: SupabaseClient, limit: number = 5) {
  try {
    console.log('Getting popular searches, limit:', limit);
    
    // Use a raw SQL query for aggregation to avoid TypeScript issues with .group()
    const { data, error } = await supabase.rpc('get_popular_searches', { 
      result_limit: limit 
    });
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error retrieving popular searches:', error);
    return { 
      success: false, 
      error: error.message,
      // Return empty data as fallback
      data: []
    };
  }
}

// Functions that were referenced but might not be fully defined
async function saveSearch(supabase: SupabaseClient, address: string, result: any, userId: string) {
  console.log('Saving search:', address, userId);
  try {
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        address,
        result,
        user_id: userId,
        is_eligible: result?.is_approved || false,
      });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving search:', error);
    return { success: false, error: error.message };
  }
}

async function getSearchHistory(supabase: SupabaseClient, userId: string, limit: number = 20) {
  console.log('Getting search history for user:', userId, limit);
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error retrieving search history:', error);
    return { success: false, error: error.message };
  }
}

async function cacheCensusResult(supabase: SupabaseClient, tractId: string, data: any, expiresInDays: number = 30) {
  console.log('Caching census result for tract:', tractId);
  try {
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    const { data: result, error } = await supabase
      .from('census_cache')
      .upsert({
        tract_id: tractId,
        data,
        expires_at: expiresAt.toISOString()
      });
      
    if (error) throw error;
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error caching census result:', error);
    return { success: false, error: error.message };
  }
}

async function getCachedCensusResult(supabase: SupabaseClient, tractId: string) {
  console.log('Getting cached census result for tract:', tractId);
  try {
    const { data, error } = await supabase
      .from('census_cache')
      .select('*')
      .eq('tract_id', tractId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (error) throw error;
    
    // Return null if no data found
    if (!data) return { success: true, data: null };
    
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error retrieving cached census result:', error);
    return { success: false, error: error.message };
  }
}
