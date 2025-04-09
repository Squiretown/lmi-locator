// Data processing utilities for HUD LMI data
import { LMIResult, GeocodingResult } from './interfaces.ts';
import { LMI_ELIGIBILITY_THRESHOLD } from './constants.ts';

/**
 * Process the LMI data to extract useful information
 */
export function processLMIData(lmiData: GeocodingResult): LMIResult {
  if (!lmiData.features || lmiData.features.length === 0) {
    return {
      isLMI: false,
      lowModPercent: 0,
      lowModPopulation: 0,
      geographyType: 'Unknown',
      geographyId: 'Unknown',
      state: 'Unknown',
      county: 'Unknown',
      message: 'No LMI data available for this location'
    };
  }
  
  const feature = lmiData.features[0];
  const attributes = feature.attributes;
  
  // Extract key information
  const result: LMIResult = {
    isLMI: attributes.LOWMODPCT >= LMI_ELIGIBILITY_THRESHOLD, // LMI qualification threshold
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
