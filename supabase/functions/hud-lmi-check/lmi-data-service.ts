
// Service for querying HUD's Low to Moderate Income data through ArcGIS

// Define TypeScript interfaces for the data structures
export interface LMICoordinates {
  latitude: number;
  longitude: number;
}

export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip?: string;
}

export interface CensusInfo {
  tract: string;
  blockGroup: string;
  state: {
    fips: string;
    name: string;
  };
  county: {
    fips: string;
    name: string;
  };
}

export interface AddressInfo {
  matchedAddress: string;
  coordinates: LMICoordinates;
  censusInfo: CensusInfo;
}

export interface LMIResult {
  isLMI: boolean;
  lowModPercent: number;
  lowModPopulation: number;
  geographyType: string;
  geographyId: string;
  state: string;
  county: string;
  geometry?: any; // GeoJSON geometry object
  addressInfo?: AddressInfo;
  message?: string;
}

// Constants for API endpoints
const LMI_TRACT_ENDPOINT = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Low_to_Moderate_Income_Population_by_Tract/FeatureServer/0/query';
const LMI_BLOCK_GROUP_ENDPOINT = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Low_to_Moderate_Income_Population_by_Block_Group/FeatureServer/0/query';
const CENSUS_GEOCODER_ENDPOINT = 'https://geocoding.geo.census.gov/geocoder/locations/address';

/**
 * Search for LMI areas by location (latitude/longitude)
 * @param coordinates - The latitude and longitude coordinates
 * @param level - Either 'tract' or 'blockGroup'
 * @returns Promise that resolves to LMI data
 */
export async function searchLMIByLocation(
  coordinates: LMICoordinates, 
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<any> {
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
    const response = await fetch(`${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching LMI data:', error);
    throw error;
  }
}

/**
 * Search for LMI areas by FIPS code
 * @param fipsCode - The FIPS code to search
 * @param level - Either 'tract' or 'blockGroup'
 * @returns Promise that resolves to LMI data
 */
export async function searchLMIByFIPS(
  fipsCode: string,
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<any> {
  const endpoint = level === 'tract' ? LMI_TRACT_ENDPOINT : LMI_BLOCK_GROUP_ENDPOINT;
  
  let whereClause = '';
  
  if (fipsCode.length === 2) {
    // State FIPS
    whereClause = `STATE = '${fipsCode}'`;
  } else if (fipsCode.length === 5) {
    // County FIPS
    whereClause = `COUNTY_FIPS = '${fipsCode}'`;
  } else if (fipsCode.length === 11) {
    // Census Tract FIPS
    whereClause = `TRACT_FIPS = '${fipsCode}'`;
  } else if (fipsCode.length === 12) {
    // Block Group FIPS
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
    const response = await fetch(`${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching LMI data:', error);
    throw error;
  }
}

/**
 * Search for LMI areas by specific street address
 * @param addressComponents - Address components
 * @param level - Either 'tract' or 'blockGroup'
 * @returns Promise that resolves to LMI data with additional address metadata
 */
export async function searchLMIByAddress(
  addressComponents: AddressComponents,
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<any> {
  const { street, city, state, zip } = addressComponents;
  
  const geocodeParams = new URLSearchParams({
    street: street,
    city: city,
    state: state,
    zip: zip || '',
    benchmark: 'Public_AR_Current',
    format: 'json'
  });
  
  try {
    // Step 1: Geocode the address
    const geocodeResponse = await fetch(`${CENSUS_GEOCODER_ENDPOINT}?${geocodeParams}`);
    if (!geocodeResponse.ok) {
      throw new Error(`HTTP error! Status: ${geocodeResponse.status}`);
    }
    
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.result || !geocodeData.result.addressMatches || geocodeData.result.addressMatches.length === 0) {
      throw new Error('Address not found or could not be geocoded');
    }
    
    const match = geocodeData.result.addressMatches[0];
    const { x: longitude, y: latitude } = match.coordinates;
    
    // Get the census tract/block information if available
    const censusBlock = match.geographies && match.geographies['Census Blocks'] 
      ? match.geographies['Census Blocks'][0] || {} 
      : {};
      
    const censusTract = match.geographies && match.geographies['Census Tracts'] 
      ? match.geographies['Census Tracts'][0] || {} 
      : {};
    
    const addressInfo: AddressInfo = {
      matchedAddress: match.matchedAddress,
      coordinates: { latitude, longitude },
      censusInfo: {
        tract: censusTract.TRACT || '',
        blockGroup: censusBlock.BLKGRP || '',
        state: {
          fips: censusTract.STATE || '',
          name: match.addressComponents ? match.addressComponents.state || state : state
        },
        county: {
          fips: censusTract.COUNTY || '',
          name: match.addressComponents ? match.addressComponents.county || '' : ''
        }
      }
    };
    
    // Step 2: Use the coordinates to search for LMI data
    const lmiData = await searchLMIByLocation({ latitude, longitude }, level);
    
    // Attach the address info to the response
    lmiData.addressInfo = addressInfo;
    
    return lmiData;
  } catch (error) {
    console.error('Error in geocoding address or fetching LMI data:', error);
    throw error;
  }
}

/**
 * Process the LMI data to extract useful information
 * @param lmiData - The raw LMI data from the API
 * @returns Processed LMI information
 */
export function processLMIData(lmiData: any): LMIResult {
  if (!lmiData.features || lmiData.features.length === 0) {
    return { 
      isLMI: false, 
      message: 'No LMI data available for this location',
      lowModPercent: 0,
      lowModPopulation: 0,
      geographyType: 'Unknown',
      geographyId: 'Unknown',
      state: 'Unknown',
      county: 'Unknown'
    };
  }
  
  const feature = lmiData.features[0];
  const attributes = feature.attributes;
  
  // Extract key information
  const result: LMIResult = {
    isLMI: attributes.LOWMODPCT >= 51, // 51% threshold for LMI qualification
    lowModPercent: attributes.LOWMODPCT,
    lowModPopulation: attributes.LOWMODUNIV,
    geographyType: attributes.GEOID ? (attributes.GEOID.length === 11 ? 'Census Tract' : 'Block Group') : 'Unknown',
    geographyId: attributes.GEOID || 'Unknown',
    state: attributes.STATE || 'Unknown',
    county: attributes.COUNTY || 'Unknown',
    geometry: feature.geometry
  };
  
  // If we have address info, include it in the result
  if (lmiData.addressInfo) {
    result.addressInfo = lmiData.addressInfo;
  }
  
  return result;
}
