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
