import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LmiResult, LmiCheckOptions } from './types';
import { getMockResponse } from './mock-data';
import { checkEnhancedLmiEligibility } from '../esri/lmi-eligibility';
import { geocodeAddressWithEsri } from './esri/geocoding';

/**
 * Check if a location is in an LMI eligible census tract
 * @param address The address or place name to check
 * @param options Configuration options for the check
 * @returns Promise with the LMI status result
 */
export const checkLmiStatus = async (
  address: string, 
  options?: LmiCheckOptions
): Promise<LmiResult> => {
  console.log('Checking LMI status for:', address);
  console.log('Options:', options);
  
  try {
    if (!address || address.trim() === '') {
      throw new Error('Address or place name is required');
    }

    // Use the enhanced check if requested
    if (options?.useEnhanced) {
      toast.info('Using enhanced LMI eligibility service...');
      return await checkEnhancedLmiEligibility(address);
    }

    // Determine which function to call based on options
    const functionName = options?.useHud ? 'hud-lmi-check' : 'lmi-check';
    const searchType = options?.searchType || 'address';
    const dataSource = options?.useHud ? 'HUD' : 'Census';
    
    toast.info(`Connecting to ${dataSource} LMI eligibility service...`);
      
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Edge function timed out after 10 seconds')), 10000);
    });
    
    // Create the edge function call promise
    const edgeFunctionPromise = supabase.functions.invoke(functionName, {
      body: { 
        address,
        searchType,
        level: options?.level || 'tract'
      }
    });
    
    // Race the promises - properly awaiting the result
    const response = await Promise.race([
      edgeFunctionPromise,
      timeoutPromise
    ]);
    
    // Now access data and error from the response
    const { data, error } = response;
    
    if (error) {
      console.error(`Error calling ${functionName} function:`, error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from LMI check');
    }
    
    // Check if the returned data is actually using mock data
    if (data.geocoding_service === "Mock Data") {
      toast.info("Edge function returned mock data");
    } else {
      toast.success(`Using real ${dataSource} geocoding data`);
    }
    
    console.log('LMI check result:', data);
    
    return data;
  } catch (error) {
    console.error('Error in checkLmiStatus:', error);
    
    // Only fall back to mock data in development mode if there's a serious error
    if (import.meta.env.DEV) {
      console.warn('Using mock data due to error');
      const mockResponse = getMockResponse(address, options?.searchType || 'address');
      toast.error("Using mock data (error fallback)");
      return mockResponse;
    } else {
      // Fall back to mock data in production too until we have a more robust solution
      console.warn('Using mock data in production due to error');
      const mockResponse = getMockResponse(address, options?.searchType || 'address');
      toast.error("Using mock data (temporary fallback)");
      return mockResponse;
    }
  }
};

/**
 * Check LMI status using HUD data (convenience method)
 * @param address The address to check
 * @param options Configuration options
 * @returns Promise with the LMI status result
 */
export const checkHudLmiStatus = async (
  address: string, 
  options?: Omit<LmiCheckOptions, 'useHud'>
): Promise<LmiResult> => {
  return checkLmiStatus(address, { 
    useHud: true,
    searchType: options?.searchType || 'address',
    level: options?.level || 'tract'
  });
};

/**
 * Check LMI status by place name using HUD data
 * @param placeName The place name to check
 * @param options Configuration options
 * @returns Promise with the LMI status result 
 */
export const checkHudLmiStatusByPlace = async (
  placeName: string, 
  options?: Pick<LmiCheckOptions, 'level'>
): Promise<LmiResult> => {
  return checkLmiStatus(placeName, {
    useHud: true,
    searchType: 'place',
    level: options?.level || 'tract'
  });
};

/**
 * Check LMI status using enhanced client-side implementation
 * This avoids the edge function call by using direct API calls
 * @param address The address to check
 * @returns Promise with the LMI status result
 */
export const checkEnhancedLmiStatus = async (address: string): Promise<LmiResult> => {
  return checkLmiStatus(address, { useEnhanced: true });
};

/**
 * Check LMI status using direct ESRI ArcGIS service
 * This is a direct implementation of the Python check_lmi_using_direct_service function
 * @param address Full address string
 * @param options Optional parameters
 * @returns Promise with LMI check result
 */
export async function checkDirectLmiStatus(
  address: string,
  options: LmiCheckOptions = {}
): Promise<LmiResult> {
  try {
    console.log('[LMI] Checking LMI status using direct ArcGIS service for:', address);
    
    // First get lat/lon for the address using the ESRI geocoding service
    const geocodeResult = await geocodeAddressWithEsri(address);
    
    if (!geocodeResult || !geocodeResult.location) {
      console.error('[LMI] Could not geocode address:', address);
      return {
        status: 'error',
        address: address,
        tract_id: 'Unknown',
        message: 'Could not geocode address',
        is_approved: false,
        approval_message: 'Could not geocode address',
        timestamp: new Date().toISOString(),
        eligibility: 'Error'
      };
    }
    
    const { x: longitude, y: latitude } = geocodeResult.location;
    console.log('[LMI] Successfully geocoded address to:', latitude, longitude);
    
    // Query the ArcGIS Feature Service directly using point geometry
    const lmiServiceUrl = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Low_to_Moderate_Income_Population_by_Tract/FeatureServer/4/query';
    
    const params = new URLSearchParams({
      geometry: `${longitude},${latitude}`,
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      returnGeometry: 'false',
      f: 'json'
    });
    
    console.log('[LMI] Querying ArcGIS LMI service');
    const response = await fetch(`${lmiServiceUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error querying LMI service: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('[LMI] ArcGIS service error:', data.error);
      return {
        status: 'error',
        address: address,
        tract_id: 'Unknown',
        message: `Error querying LMI service: ${data.error.message || 'Unknown error'}`,
        is_approved: false,
        approval_message: 'Error querying LMI service',
        timestamp: new Date().toISOString(),
        eligibility: 'Error'
      };
    }
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const attributes = feature.attributes || {};
      
      // Extract the data
      const tractId = attributes.GEOID || attributes.TRACTCE || 'Unknown';
      const lowmodPct = attributes.LOWMODPCT || attributes.LOWMOD_PCT;
      const lowmodCount = attributes.LOWMOD || attributes.LOWMOD_POP;
      const lowmodUniverse = attributes.LOWMODUNIV || attributes.LOW_UNIV;
      
      // Determine if this is an LMI tract (>=51% LMI population)
      const isLmi = lowmodPct !== null && lowmodPct >= 51.0;
      
      // Create the base result
      const result: LmiResult = {
        status: 'success',
        address: address.toUpperCase(),
        tract_id: tractId,
        hud_low_mod_percent: lowmodPct,
        hud_low_mod_population: lowmodUniverse,
        is_approved: isLmi,
        eligibility: isLmi ? 'Eligible' : 'Not Eligible',
        approval_message: isLmi 
          ? `APPROVED - This location is in a Low-Moderate Income Census Tract (${lowmodPct}% LMI)`
          : `NOT APPROVED - This location is not in a Low-Moderate Income Census Tract (only ${lowmodPct}% LMI)`,
        color_code: isLmi ? 'success' : 'danger',
        timestamp: new Date().toISOString(),
        data_source: 'ArcGIS LMI Feature Service',
        lat: latitude,
        lon: longitude
      };
      
      // Add AMI comparison for backward compatibility
      const ami = 100000; // Default value
      result.ami = ami;
      
      // Get median income if available
      const medianIncome = attributes.MEDHHINC || attributes.MED_HH_INC;
      if (medianIncome) {
        result.median_income = medianIncome;
        result.percentage_of_ami = Math.round((medianIncome / ami) * 100 * 10) / 10; // Round to 1 decimal
      }
      
      return result;
    } else {
      // No features found at this location
      console.warn('[LMI] No LMI data found for location:', latitude, longitude);
      return {
        status: 'warning',
        address: address.toUpperCase(),
        tract_id: 'Unknown',
        message: 'Address geocoded successfully, but no LMI data found for this location',
        is_approved: false,
        approval_message: 'Could not determine LMI status - no data found',
        timestamp: new Date().toISOString(),
        eligibility: 'Unknown',
        need_manual_verification: true,
        lat: latitude,
        lon: longitude
      };
    }
  } catch (error) {
    console.error('[LMI] Error checking direct LMI status:', error);
    return {
      status: 'error',
      address: address,
      tract_id: 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error checking LMI eligibility',
      is_approved: false,
      approval_message: 'Error occurred during LMI eligibility check',
      timestamp: new Date().toISOString(),
      eligibility: 'Error'
    };
  }
}
