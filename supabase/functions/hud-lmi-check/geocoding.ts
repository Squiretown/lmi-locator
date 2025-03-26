
// Geocoding service for address to place lookups
import { CENSUS_GEOCODER_ENDPOINT } from './constants';
import { LMICoordinates, AddressComponents, AddressInfo } from './interfaces';

/**
 * Geocode an address using Census Geocoder
 */
export async function geocodeAddress(address: AddressComponents): Promise<AddressInfo> {
  // Format the address components into a single line
  const formattedAddress = `${address.street}, ${address.city}, ${address.state}${address.zip ? ' ' + address.zip : ''}`;
  
  try {
    console.log(`Geocoding address: ${formattedAddress}`);
    const params = new URLSearchParams({
      address: formattedAddress,
      benchmark: 'Public_AR_Current',
      format: 'json'
    });
    
    // Make the geocoding request
    const response = await fetch(`${CENSUS_GEOCODER_ENDPOINT}?${params}`);
    if (!response.ok) {
      throw new Error(`Geocoding error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.result || !data.result.addressMatches || data.result.addressMatches.length === 0) {
      throw new Error('Address not found during geocoding');
    }
    
    // Extract the match information
    const match = data.result.addressMatches[0];
    const { x: longitude, y: latitude } = match.coordinates;
    
    // Extract census information if available
    const censusInfo = {
      tract: match.geographies?.['Census Tracts']?.[0]?.TRACT || '',
      blockGroup: match.geographies?.['Census Block Groups']?.[0]?.BLKGRP || '',
      state: {
        fips: match.geographies?.['States']?.[0]?.STATE || '',
        name: match.addressComponents?.state || ''
      },
      county: {
        fips: match.geographies?.['Counties']?.[0]?.COUNTY || '',
        name: match.addressComponents?.county || ''
      }
    };
    
    return {
      matchedAddress: match.matchedAddress,
      coordinates: { latitude, longitude },
      censusInfo
    };
  } catch (error) {
    console.error('Error in geocodeAddress:', error);
    throw error;
  }
}

/**
 * Geocode a place name (city, county, etc.)
 */
export async function geocodePlace(placeName: string): Promise<AddressInfo> {
  const params = new URLSearchParams({
    address: placeName,
    benchmark: 'Public_AR_Current',
    format: 'json'
  });
  
  try {
    console.log(`Geocoding place name: ${placeName}`);
    const response = await fetch(`${CENSUS_GEOCODER_ENDPOINT}?${params}`);
    if (!response.ok) {
      throw new Error(`Geocoding error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.result || !data.result.addressMatches || data.result.addressMatches.length === 0) {
      throw new Error('Place not found during geocoding');
    }
    
    // Extract the match information
    const match = data.result.addressMatches[0];
    const { x: longitude, y: latitude } = match.coordinates;
    
    // Create placeholder census info (might be incomplete for places)
    const censusInfo = {
      tract: '',
      blockGroup: '',
      state: {
        fips: '',
        name: match.addressComponents?.state || ''
      },
      county: {
        fips: '',
        name: match.addressComponents?.county || ''
      }
    };
    
    return {
      matchedAddress: match.matchedAddress,
      coordinates: { latitude, longitude },
      censusInfo
    };
  } catch (error) {
    console.error('Error in geocodePlace:', error);
    throw error;
  }
}

