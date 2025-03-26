import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LmiResult, LmiCheckOptions } from '../types';
import { getMockResponse } from '../mock-data';
import { checkDirectLmiStatus } from '../services/direct-lmi-services';

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

    // Use direct ArcGIS service by default since it's working
    // Only use other services if explicitly requested
    if (options?.useDirect || (!options?.useHud && !options?.useEnhanced && !options?.useMock)) {
      toast.info('Using direct ArcGIS LMI service...');
      return await checkDirectLmiStatus(address);
    }

    // Use the enhanced check if requested
    if (options?.useEnhanced) {
      toast.info('Using enhanced LMI eligibility service...');
      return await import('../esri/enhanced-check').then(m => m.checkEnhancedLmiEligibility(address));
    }

    // Use HUD service if requested
    if (options?.useHud) {
      // Determine which function to call based on options
      const functionName = 'hud-lmi-check';
      const searchType = options?.searchType || 'address';
      
      toast.info(`Connecting to HUD LMI eligibility service...`);
        
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
        toast.success(`Using real HUD geocoding data`);
      }
      
      console.log('LMI check result:', data);
      
      return data;
    }

    // Use mock data if explicitly requested for testing
    if (options?.useMock) {
      toast.info("Using mock data for testing");
      return getMockResponse(address, options?.searchType || 'address');
    }

    // If we got here, fall back to using the lmi-check edge function
    const functionName = 'lmi-check';
    toast.info(`Connecting to Census LMI eligibility service...`);
      
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Edge function timed out after 10 seconds')), 10000);
    });
    
    // Create the edge function call promise
    const edgeFunctionPromise = supabase.functions.invoke(functionName, {
      body: { 
        address,
        searchType: options?.searchType || 'address',
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
      toast.success(`Using real Census geocoding data`);
    }
    
    console.log('LMI check result:', data);
    
    return data;
  } catch (error) {
    console.error('Error in checkLmiStatus:', error);
    
    // Fall back to direct service instead of mock data
    try {
      console.warn('Attempting to use direct ArcGIS service as fallback');
      const directResult = await checkDirectLmiStatus(address);
      toast.warning("Using direct ArcGIS service (fallback)");
      return directResult;
    } catch (directError) {
      console.error('Direct service fallback failed:', directError);
      
      // Only use mock data if explicitly requested or in test environment
      if (options?.useMock) {
        console.warn('Using mock data for testing');
        const mockResponse = getMockResponse(address, options?.searchType || 'address');
        toast.info("Using mock data for testing purposes");
        return mockResponse;
      }
      
      // Otherwise, throw the error
      throw new Error("All LMI check services failed. Please try again later or contact support.");
    }
  }
};
