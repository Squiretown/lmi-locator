// Service for interacting with HUD's ArcGIS REST API endpoints
import { LMI_TRACT_ENDPOINT, LMI_BLOCK_GROUP_ENDPOINT } from './constants.ts';
import { LMICoordinates, AddressComponents, AddressInfo, GeocodingResult } from './interfaces.ts';
import { geocodeAddress, geocodePlace } from './geocoding.ts';

/**
 * Search for LMI areas by location (latitude/longitude)
 */
export async function searchLMIByLocation(
  coordinates: LMICoordinates, 
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<GeocodingResult> {
  const endpoint = level === 'tract' ? LMI_TRACT_ENDPOINT : LMI_BLOCK_GROUP_ENDPOINT;
  
  const params = new URLSearchParams({
    where: '1=1',
    geometry: `${coordinates.longitude},${coordinates.latitude}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'true',
    f: 'json'
  });
  
  try {
    console.log(`Searching LMI data for coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
    const response = await fetch(`${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('LMI location search result:', data);
    return data;
  } catch (error) {
    console.error('Error fetching LMI data:', error);
    throw error;
  }
}

/**
 * Search for LMI areas by FIPS code
 */
export async function searchLMIByFIPS(
  fipsCode: string,
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<GeocodingResult> {
  const endpoint = level === 'tract' ? LMI_TRACT_ENDPOINT : LMI_BLOCK_GROUP_ENDPOINT;
  
  let whereClause = '';
  
  if (fipsCode.length === 2) {
    whereClause = `STATE = '${fipsCode}'`;
  } else if (fipsCode.length === 5) {
    whereClause = `COUNTY_FIPS = '${fipsCode}'`;
  } else if (fipsCode.length === 11) {
    whereClause = `TRACT_FIPS = '${fipsCode}'`;
  } else if (fipsCode.length === 12) {
    whereClause = `BLKGRP_FIPS = '${fipsCode}'`;
  } else {
    throw new Error('Invalid FIPS code length');
  }
  
  const params = new URLSearchParams({
    where: whereClause,
    outFields: '*',
    returnGeometry: 'true',
    f: 'json'
  });
  
  try {
    console.log(`Searching LMI data for FIPS code: ${fipsCode}`);
    const response = await fetch(`${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('LMI FIPS search result:', data);
    return data;
  } catch (error) {
    console.error('Error fetching LMI data:', error);
    throw error;
  }
}

/**
 * Search for LMI areas by place name
 */
export async function searchLMIByPlaceName(
  placeName: string,
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<GeocodingResult> {
  console.log(`Searching LMI data for place: ${placeName}`);
  
  try {
    // Step 1: Geocode the place name
    console.log(`Geocoding place name: ${placeName}`);
    const addressInfo = await geocodePlace(placeName);
    
    // Step 2: Use the coordinates to search for LMI data
    const lmiData = await searchLMIByLocation(addressInfo.coordinates, level);
    
    // Attach the geocoded address info to the response
    lmiData.addressInfo = addressInfo;
    lmiData.placeQuery = placeName;
    
    return lmiData;
  } catch (error) {
    console.error('Error in geocoding place name or fetching LMI data:', error);
    throw error;
  }
}

/**
 * Search for LMI areas by address components
 */
export async function searchLMIByAddress(
  addressComponents: AddressComponents,
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<GeocodingResult> {
  console.log(`Searching LMI data for address: ${JSON.stringify(addressComponents)}`);
  
  try {
    // Step 1: Geocode the address components
    console.log(`Geocoding address components`);
    const addressInfo = await geocodeAddress(addressComponents);
    
    // Step 2: Use the coordinates to search for LMI data
    const lmiData = await searchLMIByLocation(addressInfo.coordinates, level);
    
    // Attach the geocoded address info to the response
    lmiData.addressInfo = addressInfo;
    
    return lmiData;
  } catch (error) {
    console.error('Error in geocoding address or fetching LMI data:', error);
    throw error;
  }
}
