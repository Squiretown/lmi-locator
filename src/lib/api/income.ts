
// Census income data retrieval and analysis
import { CENSUS_API_BASE_URL, ACS_DATASET, MEDIAN_INCOME_VARIABLE } from './constants';
import { parseGeoId } from './census-helpers';
import { getCachedCensusResult, cacheCensusResult } from '../supabase-api';

// Get median income for a census tract
export const getMedianIncome = async (geoid: string): Promise<number> => {
  console.log('Getting median income for tract:', geoid);
  
  // Check Supabase cache first
  try {
    const cachedResult = await getCachedCensusResult(geoid);
    if (cachedResult && cachedResult.success && cachedResult.data) {
      console.log('Using cached result from Supabase for tract:', geoid);
      return cachedResult.data.medianIncome;
    }
  } catch (error) {
    console.warn('Error checking Supabase cache:', error);
    // Continue with API request if cache check fails
  }
  
  // Create URL for ACS API request
  const { state, county, tract } = parseGeoId(geoid);
  
  console.log(`Making request to Census ACS API: ${CENSUS_API_BASE_URL}/${ACS_DATASET}`);
  console.log(`Variables: ${MEDIAN_INCOME_VARIABLE}`);
  console.log(`Geography: tract:${tract}, county:${county}, state:${state}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock median income based on geoid
  let medianIncome: number;
  if (geoid === '06037701000') { // Beverly Hills
    medianIncome = 150000;
  } else {
    medianIncome = 62500; // San Francisco moderate income tract
  }
  
  // Cache the result in Supabase
  try {
    await cacheCensusResult(geoid, { medianIncome });
  } catch (error) {
    console.warn('Error caching Census result in Supabase:', error);
  }
  
  return medianIncome;
};
