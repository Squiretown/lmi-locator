
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LmiResult, LmiCheckOptions } from './types';
import { getMockResponse } from './mock-data';
import { checkEnhancedLmiEligibility } from '../esri/lmi-eligibility';

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
