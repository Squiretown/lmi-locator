
// ESRI Geocoding services

import { AddressComponents } from './interfaces';
import { ESRI_GEOCODE_URL } from './constants';

/**
 * Geocode an address using ESRI's World Geocoding Service
 * @param addressComponents - The address components to geocode
 * @returns Promise that resolves to geocoding result
 */
export async function geocodeWithEsri(
  addressComponents: AddressComponents
): Promise<any> {
  const { street, city, state, zip } = addressComponents;
  
  // Format the address as a single-line string
  let singleLine = street;
  if (city) singleLine += `, ${city}`;
  if (state) singleLine += `, ${state}`;
  if (zip) singleLine += ` ${zip}`;
  
  try {
    // Construct the ESRI Geocoding Service query parameters
    const params = new URLSearchParams({
      singleLine: singleLine,
      outFields: 'Match_addr,Addr_type,StAddr,City,Region,RegionAbbr,Postal',
      outSR: '4326', // WGS84 coordinate system
      f: 'json', // Format as JSON
      maxLocations: '1' // Only return the best match
    });
    
    // Make the request to the ESRI Geocoding Service
    const response = await fetch(`${ESRI_GEOCODE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`ESRI Geocoding Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we got any candidates
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No geocoding results found for this address');
    }
    
    // Return the best match
    return data.candidates[0];
  } catch (error) {
    console.error('Error geocoding with ESRI:', error);
    throw error;
  }
}

/**
 * Geocode an area (city, county, zip code)
 * @param areaType - Type of area
 * @param areaName - Name of the area
 * @param state - State code (for city and county searches)
 * @returns Promise that resolves to geocoding result
 */
export async function geocodeArea(
  areaType: 'city' | 'county' | 'zip',
  areaName: string,
  state: string
): Promise<any> {
  let geocodeQuery: string;
  
  switch (areaType) {
    case 'city':
      geocodeQuery = `${areaName}, ${state}`;
      break;
    case 'county':
      geocodeQuery = `${areaName} County, ${state}`;
      break;
    case 'zip':
      geocodeQuery = areaName;
      break;
    default:
      throw new Error('Invalid area type. Must be "city", "county", or "zip".');
  }
  
  try {
    const params = new URLSearchParams({
      singleLine: geocodeQuery,
      outFields: 'City,Subregion,Region',
      outSR: '4326',
      f: 'json'
    });
    
    const response = await fetch(`${ESRI_GEOCODE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`ESRI Geocoding Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error(`No geocoding results found for ${areaType} "${areaName}"`);
    }
    
    // Return the best match
    return data.candidates[0];
  } catch (error) {
    console.error(`Error geocoding ${areaType}:`, error);
    throw error;
  }
}
