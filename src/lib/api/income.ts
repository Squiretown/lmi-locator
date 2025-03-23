
// Census income data retrieval and analysis
import { CENSUS_API_BASE_URL, ACS_DATASET, MEDIAN_INCOME_VARIABLE } from './constants';
import { parseGeoId } from './census-helpers';
import { getCachedCensusResult, cacheCensusResult } from '../supabase-api';
import { cachedFetch } from './cache';

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
  
  // Parse the geoid to get state, county, and tract
  const { state, county, tract } = parseGeoId(geoid);
  
  try {
    // Create URL for ACS API request
    // Get the CENSUS_API_KEY from environment
    const CENSUS_API_KEY = import.meta.env.VITE_CENSUS_API_KEY || '';
    
    const apiUrl = `${CENSUS_API_BASE_URL}/${ACS_DATASET}?get=${MEDIAN_INCOME_VARIABLE}&for=tract:${tract}&in=state:${state}%20county:${county}&key=${CENSUS_API_KEY}`;
    
    console.log(`Making request to Census ACS API: ${CENSUS_API_BASE_URL}/${ACS_DATASET}`);
    console.log(`Variables: ${MEDIAN_INCOME_VARIABLE}`);
    console.log(`Geography: tract:${tract}, county:${county}, state:${state}`);
    
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
    
    // Cache the result in Supabase
    try {
      await cacheCensusResult(geoid, { medianIncome });
    } catch (error) {
      console.warn('Error caching Census result in Supabase:', error);
    }
    
    return medianIncome;
  } catch (error) {
    console.error('Error fetching median income from Census API:', error);
    console.warn('Falling back to mock income data');
    
    // Return mock median income based on geoid as a fallback
    let medianIncome: number;
    if (geoid === '06037701000') { // Beverly Hills
      medianIncome = 150000;
    } else {
      medianIncome = 62500; // San Francisco moderate income tract
    }
    
    // Cache the fallback result in Supabase
    try {
      await cacheCensusResult(geoid, { medianIncome });
    } catch (error) {
      console.warn('Error caching Census result in Supabase:', error);
    }
    
    return medianIncome;
  }
};
