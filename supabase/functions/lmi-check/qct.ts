
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
  console.log('========== QCT CHECK START ==========');
  console.log('Checking QCT status for tract:', geoid);
  
  try {
    // Parse the geoid to get state, county, and tract
    console.log('Parsing GeoID into components...');
    const { state, county, tract } = parseGeoId(geoid);
    console.log('Parsed GeoID components:', { state, county, tract });
    
    // In a real implementation, you would call the HUD QCT API or database
    // For now, we'll simulate with mock data
    console.log('Preparing to fetch QCT data from HUD API (mock)');
    
    // Create HUD API URL (placeholder - you would need to implement the actual API call)
    // const hudApiUrl = `https://www.huduser.gov/portal/datasets/qct/qualified-census-tracts-api.html?tract=${tract}&county=${county}&state=${state}`;
    console.log('Would call HUD API with parameters:', { state, county, tract });
    
    // For development, we'll use mock data
    // In the real implementation, you would make an API call to HUD
    console.log('Using mock QCT data for development');
    const mockQctData = getMockQctData(geoid);
    
    console.log('QCT check result:', JSON.stringify(mockQctData, null, 2));
    console.log('========== QCT CHECK END ==========');
    return mockQctData;
  } catch (error) {
    console.error('Error checking QCT status:', error);
    console.log('Stack trace:', error instanceof Error && error.stack ? error.stack : 'No stack trace available');
    console.log('========== QCT CHECK ERROR END ==========');
    
    // Default response if error
    return {
      isQct: false
    };
  }
}

// Mock data function - replace with actual API call in production
function getMockQctData(geoid: string): QctResponse {
  console.log('Getting mock QCT data for tract:', geoid);
  
  // Tracts that we'll consider as QCT for testing
  const qctTracts = [
    '06075010200', // Sample low income tract in San Francisco
    '36061002700', // Sample tract in Manhattan
    '17031839100', // Sample tract in Chicago
    '12086009801', // Sample tract in Miami
    '48201231100', // Sample tract in Houston
    '25025081200', // Sample tract in Boston
    '53033005700', // Sample tract in Seattle
  ];
  
  const isQct = qctTracts.includes(geoid);
  console.log('Is this tract a QCT?', isQct);
  
  if (isQct) {
    return {
      isQct: true,
      details: {
        year: 2023,
        designation_type: "Income",
        poverty_rate: 32.5,
        income_threshold: 60,
        additional_info: "Designated as QCT based on income criteria"
      }
    };
  }
  
  return {
    isQct: false
  };
}
