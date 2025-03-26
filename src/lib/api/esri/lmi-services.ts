
// LMI data services using ESRI APIs

import { LMICoordinates, AddressComponents, LMIResult, AreaType } from './interfaces';
import { LMI_TRACT_URL, LMI_BLOCK_GROUP_URL } from './constants';
import { geocodeWithEsri, geocodeArea } from './geocoding';

/**
 * Search for LMI areas by location (latitude/longitude) using direct ESRI API
 * @param coordinates - The latitude and longitude coordinates
 * @param level - Either 'tract' or 'blockGroup'
 * @returns Promise that resolves to LMI data
 */
export async function searchLMIByLocation(
  coordinates: LMICoordinates, 
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<any> {
  // Select the appropriate endpoint based on the level
  const endpoint = level === 'tract' ? LMI_TRACT_URL : LMI_BLOCK_GROUP_URL;
  
  try {
    // Construct the ESRI REST API query parameters
    const params = new URLSearchParams({
      where: '1=1', // Return all features that intersect with the point
      geometry: `${coordinates.longitude},${coordinates.latitude}`,
      geometryType: 'esriGeometryPoint',
      inSR: '4326', // WGS84 coordinate system
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*', // Return all fields
      returnGeometry: 'true',
      f: 'json' // Format as JSON
    });
    
    // Make the request to the ESRI REST API
    const response = await fetch(`${endpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error(`ESRI API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching LMI data from ESRI API:', error);
    throw error;
  }
}

/**
 * Search for LMI areas by FIPS code using direct ESRI API
 * @param fipsCode - The FIPS code to search
 * @param level - Either 'tract' or 'blockGroup'
 * @returns Promise that resolves to LMI data
 */
export async function searchLMIByFIPS(
  fipsCode: string,
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<any> {
  // Select the appropriate endpoint based on the level
  const endpoint = level === 'tract' ? LMI_TRACT_URL : LMI_BLOCK_GROUP_URL;
  
  // Determine the field to search based on FIPS code length
  let whereClause: string;
  
  if (fipsCode.length === 2) {
    // State FIPS code
    whereClause = `STATE = '${fipsCode}'`;
  } else if (fipsCode.length === 5) {
    // County FIPS code (STATE + COUNTY)
    whereClause = `COUNTY_FIPS = '${fipsCode}'`;
  } else if (fipsCode.length === 11) {
    // Census Tract FIPS code
    whereClause = `TRACT_FIPS = '${fipsCode}'`;
  } else if (fipsCode.length === 12) {
    // Block Group FIPS code
    whereClause = `BLKGRP_FIPS = '${fipsCode}'`;
  } else {
    throw new Error('Invalid FIPS code length. Must be 2, 5, 11, or 12 characters.');
  }
  
  try {
    // Construct the ESRI REST API query parameters
    const params = new URLSearchParams({
      where: whereClause,
      outFields: '*', // Return all fields
      returnGeometry: 'true',
      f: 'json' // Format as JSON
    });
    
    // Make the request to the ESRI REST API
    const response = await fetch(`${endpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error(`ESRI API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching LMI data from ESRI API:', error);
    throw error;
  }
}

/**
 * Search for LMI areas by address using direct ESRI API
 * @param addressComponents - Address components
 * @param level - Either 'tract' or 'blockGroup'
 * @returns Promise that resolves to LMI data with additional address metadata
 */
export async function searchLMIByAddress(
  addressComponents: AddressComponents,
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<any> {
  try {
    // Step 1: Geocode the address using ESRI's service
    const geocodeResult = await geocodeWithEsri(addressComponents);
    
    // Extract the coordinates
    const { x: longitude, y: latitude } = geocodeResult.location;
    
    // Create addressInfo object from geocode result
    const addressInfo = {
      matchedAddress: geocodeResult.address,
      coordinates: { latitude, longitude },
      attributes: geocodeResult.attributes
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
 * Search for multiple LMI areas within a geographic boundary
 * @param areaType - Type of area ('city', 'county', 'zip')
 * @param areaName - Name of the area
 * @param state - State code (for city and county searches)
 * @param level - Either 'tract' or 'blockGroup'
 * @returns Promise that resolves to LMI areas data
 */
export async function searchLMIByArea(
  areaType: 'city' | 'county' | 'zip',
  areaName: string,
  state: string,
  level: 'tract' | 'blockGroup' = 'tract'
): Promise<any> {
  try {
    // First, geocode the area
    const bestMatch = await geocodeArea(areaType, areaName, state);
    const { x: longitude, y: latitude } = bestMatch.location;
    
    // Now search for LMI areas using a spatial query
    // We'll create a simple buffer around the point (in a real implementation,
    // you'd want to use actual administrative boundaries)
    
    // Select the appropriate endpoint based on the level
    const endpoint = level === 'tract' ? LMI_TRACT_URL : LMI_BLOCK_GROUP_URL;
    
    // Construct a buffer geometry (simplistic example - in a real application,
    // you would want to get the actual administrative boundary)
    // This creates a 10km buffer around the geocoded point
    const bufferSize = 0.1; // roughly 10km in decimal degrees
    const buffer = {
      xmin: longitude - bufferSize,
      ymin: latitude - bufferSize,
      xmax: longitude + bufferSize,
      ymax: latitude + bufferSize,
      spatialReference: { wkid: 4326 }
    };
    
    const lmiParams = new URLSearchParams({
      where: '1=1',
      geometry: JSON.stringify(buffer),
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      returnGeometry: 'true',
      f: 'json'
    });
    
    const lmiResponse = await fetch(`${endpoint}?${lmiParams}`);
    
    if (!lmiResponse.ok) {
      throw new Error(`ESRI API Error: ${lmiResponse.status} ${lmiResponse.statusText}`);
    }
    
    const lmiData = await lmiResponse.json();
    
    // Add the area info to the response
    lmiData.areaInfo = {
      type: areaType,
      name: areaName,
      state: state,
      coordinates: {
        latitude,
        longitude
      }
    };
    
    return lmiData;
  } catch (error) {
    console.error('Error in area search:', error);
    throw error;
  }
}

/**
 * Perform a bulk search for LMI areas for analysis or marketing
 * @param areaType - Type of area ('city', 'county', 'state')
 * @param areaName - Name of the area
 * @param state - State code (for city and county searches)
 * @param limit - Maximum number of results (default: 100)
 * @returns Promise that resolves to LMI areas data with statistics
 */
export async function bulkLMISearch(
  areaType: 'city' | 'county' | 'state',
  areaName: string,
  state: string,
  limit: number = 100
): Promise<any> {
  try {
    // First, get all LMI areas in the specified geography
    const lmiAreas = await searchLMIByArea(areaType as any, areaName, state, 'blockGroup');
    
    if (!lmiAreas.features || lmiAreas.features.length === 0) {
      return {
        success: false,
        message: 'No LMI areas found in the specified region',
        results: []
      };
    }
    
    // Filter for areas that meet LMI threshold (51% or more)
    const qualifiedLmiAreas = lmiAreas.features.filter((feature: any) => 
      feature.attributes.LOWMODPCT >= 51);
    
    if (qualifiedLmiAreas.length === 0) {
      return {
        success: false,
        message: 'No qualifying LMI areas (>51%) found in the specified region',
        results: []
      };
    }
    
    // Process the results
    const resultLimit = Math.min(limit, qualifiedLmiAreas.length);
    const results = qualifiedLmiAreas.slice(0, resultLimit).map((area: any) => ({
      lmiArea: {
        type: 'blockGroup',
        geoid: area.attributes.GEOID,
        lowModPercent: area.attributes.LOWMODPCT,
        state: area.attributes.STATE,
        county: area.attributes.COUNTY
      },
      geometry: area.geometry,
      // In a real implementation, you might connect to a property database
      // This is just placeholder data
      stats: {
        estimatedProperties: Math.floor(Math.random() * 150) + 50,
        medianValue: Math.floor(Math.random() * 200000) + 100000,
        averageYearBuilt: Math.floor(Math.random() * 50) + 1970
      }
    }));
    
    return {
      success: true,
      totalLmiAreas: qualifiedLmiAreas.length,
      areasReturned: results.length,
      summary: {
        averageLowModPercent: qualifiedLmiAreas.reduce((sum: number, area: any) => 
          sum + area.attributes.LOWMODPCT, 0) / qualifiedLmiAreas.length,
        totalLowModPopulation: qualifiedLmiAreas.reduce((sum: number, area: any) => 
          sum + area.attributes.LOWMODUNIV, 0)
      },
      results
    };
  } catch (error) {
    console.error('Error in bulk LMI search:', error);
    throw error;
  }
}
