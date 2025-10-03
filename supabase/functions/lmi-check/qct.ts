
// QCT (Qualified Census Tract) status checker

/**
 * Parses a Census Geographic Identifier (GeoID) into its component parts
 * 
 * @param geoId The geographic identifier string to parse
 * @returns Object containing state, county, and tract components
 */
function parseGeoId(geoId: string): { state: string; county: string; tract: string } {
  if (!geoId) {
    throw new Error('GeoID is required');
  }
  
  // Clean up the GeoID - remove any non-alphanumeric characters except decimal points
  const cleanGeoId = geoId.replace(/[^\w\.]/g, '');
  
  // Standard format handling (SSCCCTTTTTT)
  if (cleanGeoId.length >= 11) {
    return {
      state: cleanGeoId.substring(0, 2),
      county: cleanGeoId.substring(2, 5),
      tract: cleanGeoId.substring(5)
    };
  } else if (cleanGeoId.includes('.')) {
    // Format with explicit decimal separator
    const parts = cleanGeoId.split('.');
    
    if (parts[0].length >= 5) {
      return {
        state: parts[0].substring(0, 2),
        county: parts[0].substring(2, 5),
        tract: parts[0].substring(5) + '.' + parts[1]
      };
    } else {
      return {
        state: parts[0].substring(0, 2),
        county: parts[0].substring(2),
        tract: parts[1]
      };
    }
  } else {
    // Handle shorter formats
    if (cleanGeoId.length >= 5) {
      return {
        state: cleanGeoId.substring(0, 2),
        county: cleanGeoId.substring(2, Math.min(5, cleanGeoId.length)),
        tract: cleanGeoId.length > 5 ? cleanGeoId.substring(5) : ''
      };
    } else {
      throw new Error(`Invalid GeoID format: ${geoId}`);
    }
  }
}

interface QctResponse {
  isQct: boolean;
  details?: {
    year: number;
    designation_type: string;
    poverty_rate?: number;
    income_threshold?: number;
    additional_info?: string;
  };
}

// Get QCT (Qualified Census Tract) status for a given census tract
export async function getQctStatus(geoid: string): Promise<QctResponse> {
  console.log('QCT check requested for tract:', geoid);
  console.log('QCT verification is temporarily disabled - awaiting HUD API integration');
  
  // Return disabled status with explanation
  return {
    isQct: false,
    details: {
      year: new Date().getFullYear(),
      designation_type: 'Not Available',
      additional_info: 'QCT verification is currently unavailable. This feature requires HUD API integration which is pending implementation. Please check back later or contact support for manual verification.'
    }
  };
}

