
import { ESRI_API_KEY } from '../esri/config';
import { geocodeAddressWithEsri } from './geocoding/index';
import { processLMIData, searchLMIByLocation } from './lmi-services';
import { LmiResult } from '../lmi/types';

/**
 * Enhanced check for LMI eligibility that follows a similar process to the Python version
 * @param address Full address string
 * @returns Promise with detailed LMI eligibility information
 */
export async function checkEnhancedLmiEligibility(address: string): Promise<LmiResult> {
  try {
    console.log('[ESRI] Enhanced LMI check for address:', address);
    
    // Step 1: Geocode the address to get coordinates
    const geocodeResult = await geocodeAddressWithEsri(address);
    
    if (!geocodeResult || !geocodeResult.location) {
      throw new Error('Could not geocode address');
    }
    
    const { x: longitude, y: latitude } = geocodeResult.location;
    
    console.log('[ESRI] Successfully geocoded to:', latitude, longitude);
    
    // Step 2: Search LMI data by coordinates
    const lmiData = await searchLMIByLocation({ latitude, longitude }, 'tract');
    
    if (!lmiData || !lmiData.features || lmiData.features.length === 0) {
      throw new Error('Could not find LMI data for this location');
    }
    
    // Step 3: Process LMI data
    const lmiResult = processLMIData(lmiData);
    
    // Step 4: Format the response similar to Python implementation
    const result: LmiResult = {
      status: 'success',
      address: address.toUpperCase(),
      tract_id: lmiResult.geographyId,
      is_approved: lmiResult.isLMI,
      hud_low_mod_percent: lmiResult.lowModPercent,
      hud_low_mod_population: lmiResult.lowModPopulation,
      eligibility: lmiResult.isLMI ? 'Eligible' : 'Not Eligible',
      approval_message: lmiResult.isLMI 
        ? `APPROVED - This location is in a Low-Moderate Income Census Tract (${lmiResult.lowModPercent}% LMI)`
        : `NOT APPROVED - This location is not in a Low-Moderate Income Census Tract (only ${lmiResult.lowModPercent}% LMI)`,
      color_code: lmiResult.isLMI ? 'success' : 'danger',
      timestamp: new Date().toISOString(),
      data_source: 'HUD Low-to-Moderate Income (LMI) Summary Data',
      geocoding_service: 'ESRI'
    };
    
    // Add additional data from Census API if available
    try {
      const medianIncome = await getCensusTractMedianIncome(lmiResult.geographyId);
      if (medianIncome) {
        result.median_income = medianIncome;
      }
    } catch (error) {
      console.warn('Could not retrieve median income data:', error);
      // Continue without median income data
    }
    
    return result;
  } catch (error) {
    console.error('Error in enhanced LMI eligibility check:', error);
    
    // Return an error result
    return {
      status: 'error',
      address: address,
      message: error instanceof Error ? error.message : 'Unknown error checking LMI eligibility',
      is_approved: false,
      timestamp: new Date().toISOString(),
      eligibility: 'Error'
    };
  }
}

/**
 * Get median household income for a census tract using Census API
 * @param tractId The census tract ID (GEOID)
 * @returns Promise with median income or null if not available
 */
async function getCensusTractMedianIncome(tractId: string): Promise<number | undefined> {
  try {
    if (!tractId || tractId === 'Unknown') {
      console.warn('Cannot get median income for unknown tract');
      return undefined;
    }
    
    console.log('[Census] Getting median income for tract:', tractId);
    
    // Parse out state, county and tract codes
    // Format is: SSCCCTTTTTT (SS=state, CCC=county, TTTTTT=tract)
    if (tractId.length !== 11) {
      console.error('Invalid tract ID format:', tractId);
      return undefined;
    }
    
    const stateFips = tractId.substring(0, 2);
    const countyFips = tractId.substring(2, 5);
    const tractCode = tractId.substring(5);
    
    // Use Census API to get median household income from ACS
    const url = `https://api.census.gov/data/2022/acs/acs5?get=B19013_001E&for=tract:${tractCode}&in=state:${stateFips}+county:${countyFips}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Census API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 1) {  // First row is headers
      const incomeStr = data[1][0]; 
      if (incomeStr && incomeStr !== 'null') {
        const medianIncome = parseInt(incomeStr, 10);
        console.log(`[Census] Median household income for tract ${tractId}: $${medianIncome}`);
        return medianIncome;
      }
    }
    
    console.warn(`[Census] No income data found for tract ${tractId}`);
    return undefined;
  } catch (error) {
    console.error('[Census] Error getting median income:', error);
    return undefined;
  }
}

/**
 * Get the census tract ID for a given location using the Census Geocoder API
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with census tract ID or undefined if not found
 */
export async function getCensusTractByCoordinates(latitude: number, longitude: number): Promise<string | undefined> {
  try {
    console.log('[Census] Getting census tract for coordinates:', latitude, longitude);
    
    const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${longitude}&y=${latitude}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Census Geocoder error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.result && data.result.geographies) {
      const tracts = data.result.geographies['Census Tracts'];
      if (tracts && tracts.length > 0) {
        const geoid = tracts[0].GEOID;
        console.log('[Census] Found census tract:', geoid);
        return geoid;
      }
    }
    
    console.warn('[Census] No census tract found for coordinates:', latitude, longitude);
    return undefined;
  } catch (error) {
    console.error('[Census] Error getting census tract:', error);
    return undefined;
  }
}
