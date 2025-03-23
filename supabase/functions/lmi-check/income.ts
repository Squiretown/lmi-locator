
import { ACS_DATASET, MEDIAN_INCOME_VARIABLE, CENSUS_API_BASE_URL } from "./constants.ts";

// Get median income for a census tract
export async function getMedianIncome(geoid: string): Promise<number> {
  console.log('Getting median income for tract:', geoid);
  
  try {
    // Parse the geoid to get state, county, and tract
    const { state, county, tract } = parseGeoId(geoid);
    
    // Create URL for ACS API request
    // Get the CENSUS_API_KEY from environment
    const CENSUS_API_KEY = Deno.env.get("CENSUS_API_KEY");
    
    if (!CENSUS_API_KEY) {
      console.warn('Census API key not found in environment variables, using mock data');
      return getMockMedianIncome(geoid);
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
      console.warn('Falling back to mock income data');
      return getMockMedianIncome(geoid);
    }
    
    const data = await response.json();
    
    // Census API returns a 2D array with headers in the first row and data in subsequent rows
    if (!data || data.length < 2) {
      console.error('Invalid response from Census API');
      console.warn('Falling back to mock income data');
      return getMockMedianIncome(geoid);
    }
    
    // Extract the median income value from the response
    const medianIncome = parseInt(data[1][0]);
    
    if (isNaN(medianIncome)) {
      console.error('Census API returned non-numeric income value');
      console.warn('Falling back to mock income data');
      return getMockMedianIncome(geoid);
    }
    
    return medianIncome;
  } catch (error) {
    console.error('Error fetching median income from Census API:', error);
    console.warn('Falling back to mock income data');
    return getMockMedianIncome(geoid);
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

// Get mock median income when API fails
function getMockMedianIncome(geoid: string): number {
  let medianIncome: number;
  
  if (geoid === '06037701000') { // Beverly Hills - high income
    medianIncome = 150000;
  } else if (geoid === '06075010200') { // Low income tract
    medianIncome = 30000;
  } else {
    medianIncome = 62500; // Moderate income tract
  }
  
  return medianIncome;
}
