
import { ESRI_API_KEY } from '../config';
import { ESRI_GEOCODE_URL } from '../constants';
import { AddressComponents } from '../interfaces';

/**
 * Geocode an address using the ESRI geocoding API
 * @param address Full address string or components
 * @returns Geocoding result with coordinates and address info
 */
export const geocodeAddressWithEsri = async (address: string | AddressComponents): Promise<any> => {
  try {
    console.log(`[ESRI] Geocoding address:`, address);
    
    // Determine if we're dealing with a string or address components
    let singleLine: string;
    
    if (typeof address === 'string') {
      singleLine = address;
    } else {
      // Build single line from components
      const { street, city, state, zip } = address;
      singleLine = street;
      if (city) singleLine += `, ${city}`;
      if (state) singleLine += `, ${state}`;
      if (zip) singleLine += ` ${zip}`;
    }
    
    // Construct the ESRI Geocoding Service query parameters
    const params = new URLSearchParams({
      singleLine: singleLine,
      outFields: 'Match_addr,Addr_type,StAddr,City,Region,RegionAbbr,Postal',
      outSR: '4326', // WGS84 coordinate system
      f: 'json', // Format as JSON
      maxLocations: '1' // Only return the best match
    });
    
    // Add API key if available
    if (ESRI_API_KEY) {
      params.append('token', ESRI_API_KEY);
    }
    
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
    console.error('[ESRI] Error geocoding with ESRI:', error);
    throw error;
  }
};

// Re-export helper functions from other geocoding modules
export * from './standard-endpoint';
export * from './api-endpoint';
export * from './single-line';
export * from './parsed-components';
export * from './auth-header';
export * from './types';
