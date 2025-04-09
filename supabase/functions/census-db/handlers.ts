
// Define constants locally instead of importing from another edge function
const CENSUS_API_BASE_URL = "https://api.census.gov/data";
const ACS_DATASET = "2019/acs/acs5"; // Using 2019 ACS 5-year estimates
const MEDIAN_INCOME_VARIABLE = "B19013_001E"; // Median household income variable

export async function getMedianIncome(params: { geoid: string, state: string, county: string, tract: string }) {
  console.log('Getting median income for tract:', params.geoid);
  
  try {
    // Get Census API Key from Deno environment
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

// Add the handleApiRequest function to process different API requests
export async function handleApiRequest(supabase: any, action: string, params: any) {
  switch (action) {
    case 'getMedianIncome':
      return await getMedianIncome(params);
    // Add more actions as needed
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
