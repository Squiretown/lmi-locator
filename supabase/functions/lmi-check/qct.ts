
// QCT (Qualified Census Tract) status checker
import { parseGeoId } from "./constants.ts";

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
  console.log('Checking QCT status for tract:', geoid);
  
  try {
    // Parse the geoid to get state, county, and tract
    const { state, county, tract } = parseGeoId(geoid);
    
    // In a real implementation, you would call the HUD QCT API or database
    // For now, we'll simulate with mock data
    
    // Create HUD API URL (placeholder - you would need to implement the actual API call)
    // const hudApiUrl = `https://www.huduser.gov/portal/datasets/qct/qualified-census-tracts-api.html?tract=${tract}&county=${county}&state=${state}`;
    
    // For development, we'll use mock data
    // In the real implementation, you would make an API call to HUD
    const mockQctData = getMockQctData(geoid);
    
    return mockQctData;
  } catch (error) {
    console.error('Error checking QCT status:', error);
    
    // Default response if error
    return {
      isQct: false
    };
  }
}

// Mock data function - replace with actual API call in production
function getMockQctData(geoid: string): QctResponse {
  // Tracts that we'll consider as QCT for testing
  const qctTracts = [
    '06075010200', // Sample low income tract
    '36061002700', // Sample tract in Manhattan
    '17031839100'  // Sample tract in Chicago
  ];
  
  const isQct = qctTracts.includes(geoid);
  
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
