
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

    // Always try to use real data sources first

    // Use direct ArcGIS service first since it's most reliable
    try {
      toast.info('Checking LMI status using ArcGIS service...');
      const result = await checkDirectLmiStatus(address);
      toast.success('Retrieved LMI status from ArcGIS');
      return result;
    } catch (directError) {
      console.warn('Direct ArcGIS service failed:', directError);
      // Continue to next method
    }

    // Next try the enhanced service
    if (!options?.useMock) {
      try {
        toast.info('Using enhanced LMI eligibility service...');
        const result = await import('../esri/enhanced-check').then(m => m.checkEnhancedLmiEligibility(address));
        toast.success('Retrieved LMI status from enhanced service');
        return result;
      } catch (enhancedError) {
        console.warn('Enhanced service failed:', enhancedError);
        // Continue to next method
      }
    }

    // Next try the edge function service
    if (!options?.useMock) {
      try {
        // Determine which function to call based on options
        const functionName = options?.useHud ? 'hud-lmi-check' : 'lmi-check';
        const searchType = options?.searchType || 'address';
        
        toast.info(`Connecting to ${options?.useHud ? 'HUD' : 'Census'} LMI eligibility service...`);
          
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
        
        // Check if the returned data is using mock data
        if (data.geocoding_service === "Mock Data") {
          toast.warning("Service returned mock data");
        } else {
          toast.success(`Using real ${options?.useHud ? 'HUD' : 'Census'} data`);
        }
        
        console.log('LMI check result:', data);
        
        return data;
      } catch (edgeFunctionError) {
        console.warn('Edge function failed:', edgeFunctionError);
        // Continue to last method
      }
    }

    // Only use mock data if explicitly requested or all other methods failed
    if (options?.useMock) {
      toast.info("Using mock data for testing");
      return getMockResponse(address, options?.searchType || 'address');
    } else {
      throw new Error("All LMI check services failed. Please try again later.");
    }
  } catch (error) {
    console.error('Error in checkLmiStatus:', error);
    toast.error("Failed to check LMI status. Please try again.");
    
    // Fall back to mock data as a last resort
    console.warn('Using mock data as last resort');
    const mockResponse = getMockResponse(address, options?.searchType || 'address');
    toast.warning("Using fallback mock data due to service errors");
    return mockResponse;
  }
};
