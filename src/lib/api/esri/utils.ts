
// Utility functions for processing LMI data

import { LMIResult, LMICoordinates } from './interfaces';
import { LMI_THRESHOLD } from './constants';

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
    isLMI: attributes.LOWMODPCT >= LMI_THRESHOLD, // Using defined threshold constant
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

/**
 * Get information about available assistance programs for an LMI-qualified property
 * @param state - State code (e.g., 'FL')
 * @param isLMI - Whether the property is in an LMI area
 * @returns Programs and resources information
 */
export function getAssistancePrograms(state: string, isLMI: boolean): any {
  // Base programs available everywhere
  const programs = [
    {
      name: "FHA Home Loans",
      description: "Lower down payment requirements and flexible credit qualification.",
      eligibilityNotes: "Not restricted to LMI areas but beneficial for LMI homebuyers.",
      link: "https://www.hud.gov/buying/loans"
    },
    {
      name: "VA Home Loans",
      description: "For veterans, service members, and eligible surviving spouses.",
      eligibilityNotes: "Based on military service, not income or area.",
      link: "https://www.va.gov/housing-assistance/home-loans/"
    }
  ];
  
  // Add LMI-specific programs
  if (isLMI) {
    programs.push(
      {
        name: "Community Development Block Grant (CDBG)",
        description: "Local home buyer assistance programs funded by HUD.",
        eligibilityNotes: "Available in LMI areas. Contact local housing authority.",
        link: "https://www.hud.gov/program_offices/comm_planning/cdbg"
      },
      {
        name: "HOME Investment Partnerships Program",
        description: "Down payment assistance for low-income homebuyers.",
        eligibilityNotes: "For households below 80% of area median income.",
        link: "https://www.hudexchange.info/programs/home/"
      }
    );
  }
  
  // Add state-specific programs (would come from a database in real implementation)
  if (state === 'FL') {
    programs.push({
      name: "Florida Housing Finance Corporation Programs",
      description: "First-time homebuyer programs, lower interest loans and purchase assistance.",
      eligibilityNotes: "Various programs with different eligibility requirements.",
      link: "https://www.floridahousing.org/"
    });
  }
  
  return {
    isLMI,
    state,
    programCount: programs.length,
    programs
  };
}

/**
 * Generate a map URL for a location to show LMI status
 * @param coordinates - Latitude/longitude coordinates
 * @param isLMI - Whether the location is in an LMI area
 * @returns Static map URL
 */
export function generateMapUrl(coordinates: LMICoordinates, isLMI: boolean): string {
  // This is a simple implementation using OpenStreetMap's static map API
  // In a real implementation, you might use ArcGIS Online, Mapbox, or Google Maps
  
  const { latitude, longitude } = coordinates;
  const zoom = 14;
  const markerColor = isLMI ? 'green' : 'red';
  
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=600x400&markers=${latitude},${longitude},${markerColor}`;
}

/**
 * Export a report of LMI data for printing or saving
 * @param lmiResult - Processed LMI result
 * @returns Report data object
 */
export function generateReport(lmiResult: LMIResult): any {
  const currentDate = new Date().toLocaleDateString();
  
  return {
    title: 'Low to Moderate Income (LMI) Area Qualification Report',
    generatedDate: currentDate,
    property: lmiResult.addressInfo ? lmiResult.addressInfo.matchedAddress : 'Unknown',
    qualification: {
      isLMI: lmiResult.isLMI,
      lowModPercent: lmiResult.lowModPercent,
      threshold: LMI_THRESHOLD,
      thresholdMet: lmiResult.isLMI
    },
    geography: {
      type: lmiResult.geographyType,
      id: lmiResult.geographyId,
      state: lmiResult.state,
      county: lmiResult.county
    },
    population: {
      lowModIncome: lmiResult.lowModPopulation
    },
    mapUrl: lmiResult.addressInfo ? 
      generateMapUrl(lmiResult.addressInfo.coordinates, lmiResult.isLMI) : 
      null,
    disclaimer: 'This report is based on HUD\'s Low and Moderate Income Summary Data. The data is updated periodically by HUD. This report is for informational purposes only.'
  };
}
