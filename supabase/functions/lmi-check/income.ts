
import { CENSUS_API_BASE_URL, ACS_DATASET, MEDIAN_INCOME_VARIABLE } from "./constants.ts";

export async function getMedianIncome(geoid: string): Promise<number> {
  console.log('========== INCOME DATA FETCH START ==========');
  console.log('Getting median income for tract:', geoid);
  
  try {
    // Parse the geoid to get state, county, and tract
    console.log('Parsing GeoID into components...');
    const { state, county, tract } = parseGeoId(geoid);
    console.log('Parsed GeoID components:', { state, county, tract });
    
    // Get the CENSUS_API_KEY from environment
    const CENSUS_API_KEY = Deno.env.get("CENSUS_API_KEY");
    
    if (!CENSUS_API_KEY) {
      console.error('Census API key not found in environment variables');
      throw new Error('Census API key not configured');
    }
    
    const apiUrl = `${CENSUS_API_BASE_URL}/${ACS_DATASET}?get=${MEDIAN_INCOME_VARIABLE}&for=tract:${tract}&in=state:${state}%20county:${county}&key=${CENSUS_API_KEY}`;
    
    console.log(`Making request to Census ACS API: ${apiUrl}`);
    
    // Make the API request
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    if (!response.ok) {
      console.error(`Census API request failed: ${response.status} ${response.statusText}`);
      console.error('Census API request failed:', response.status, response.statusText);
      throw new Error(`Census API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Census ACS API raw response:', JSON.stringify(data, null, 2));
    
    // Census API returns a 2D array with headers in the first row and data in subsequent rows
    if (!data || data.length < 2) {
      console.error('Invalid response from Census API');
      console.error('Invalid response from Census API');
      throw new Error('Invalid response from Census API');
    }
    
    // Extract the median income value from the response
    const medianIncome = parseInt(data[1][0]);
    
    if (isNaN(medianIncome)) {
      console.error('Census API returned non-numeric income value');
      console.error('Census API returned non-numeric income value');
      throw new Error('Census API returned invalid data');
    }
    
    console.log('Successfully retrieved median income:', medianIncome);
    console.log('========== INCOME DATA FETCH END (SUCCESS) ==========');
    return medianIncome;
  } catch (error) {
    console.error('Error fetching median income from Census API:', error);
    console.error('Median income error stack:', error.stack);
    console.error('Error fetching median income from Census API:', error);
    throw error;
  }
}

// Helper function to parse GeoID
function parseGeoId(geoid: string): { state: string, county: string, tract: string } {
  // GEOID format: SSCCCTTTTTT (2-digit state, 3-digit county, 6-digit tract)
  const state = geoid.substring(0, 2);
  const county = geoid.substring(2, 5);
  const tract = geoid.substring(5);
  
  return { state, county, tract };
}

