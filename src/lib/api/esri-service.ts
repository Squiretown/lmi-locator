
import { ESRI_GEOCODING_URL, ESRI_REVERSE_GEOCODING_URL } from './constants';
import { cachedFetch } from './cache';

// Type definitions for ESRI API responses
interface EsriGeocodeResponse {
  candidates: {
    address: string;
    location: {
      x: number;  // longitude
      y: number;  // latitude
    };
    score: number;
    attributes: Record<string, any>;
  }[];
  spatialReference?: {
    wkid: number;
    latestWkid: number;
  };
}

interface EsriReverseGeocodeResponse {
  address: {
    Match_addr: string;
    LongLabel: string;
    ShortLabel: string;
    Addr_type: string;
    Type: string;
    PlaceName: string;
    AddNum: string;
    Address: string;
    Block: string;
    Sector: string;
    Neighborhood: string;
    District: string;
    City: string;
    MetroArea: string;
    Subregion: string;
    Region: string;
    RegionAbbr: string;
    Territory: string;
    Postal: string;
    PostalExt: string;
    CountryCode: string;
  };
  location: {
    x: number;  // longitude
    y: number;  // latitude
  };
}

// Your ESRI API key
const ESRI_API_KEY = "YOUR_ESRI_API_KEY_HERE"; // Replace with your actual ESRI API key

/**
 * Geocode an address using the ESRI geocoding API
 * @param address Full address string to geocode
 * @returns Geocoding result with coordinates and address info
 */
export const geocodeAddressWithEsri = async (address: string): Promise<{
  lat: number;
  lon: number;
  formattedAddress?: string;
  score?: number;
}> => {
  try {
    if (!ESRI_API_KEY) {
      throw new Error('ESRI API key not found');
    }
    
    const params = new URLSearchParams({
      address: address,
      outFields: 'Addr_type,StAddr,City,Region,Postal',
      f: 'json',
      token: ESRI_API_KEY,
      maxLocations: '1'
    });
    
    console.log(`Making request to ESRI Geocoder for address: ${address}`);
    
    // Use the cache wrapper if available, otherwise direct fetch
    const response = await fetch(`${ESRI_GEOCODING_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`ESRI API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: EsriGeocodeResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No geocoding candidates found for the address');
    }
    
    const bestMatch = data.candidates[0];
    
    return {
      lat: bestMatch.location.y,
      lon: bestMatch.location.x,
      formattedAddress: bestMatch.address,
      score: bestMatch.score
    };
  } catch (error) {
    console.error('Error geocoding with ESRI:', error);
    throw error;
  }
};

/**
 * Perform reverse geocoding using ESRI API
 * @param lat Latitude coordinate
 * @param lon Longitude coordinate
 * @returns Address information
 */
export const reverseGeocodeWithEsri = async (lat: number, lon: number): Promise<{
  address: string;
  city?: string;
  state?: string;
  zip?: string;
}> => {
  try {
    if (!ESRI_API_KEY) {
      throw new Error('ESRI API key not found');
    }
    
    const params = new URLSearchParams({
      location: `${lon},${lat}`,
      f: 'json',
      token: ESRI_API_KEY,
      outFields: '*'
    });
    
    console.log(`Making reverse geocode request to ESRI for coordinates: ${lat}, ${lon}`);
    
    const response = await fetch(`${ESRI_REVERSE_GEOCODING_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`ESRI reverse geocode request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: EsriReverseGeocodeResponse = await response.json();
    
    return {
      address: data.address.Match_addr,
      city: data.address.City,
      state: data.address.RegionAbbr,
      zip: data.address.Postal
    };
  } catch (error) {
    console.error('Error reverse geocoding with ESRI:', error);
    throw error;
  }
};
