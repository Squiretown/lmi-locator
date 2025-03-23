
// LMI status checking functionality
import { supabase } from "@/integrations/supabase/client";

// Check if a location is in an LMI eligible census tract
export const checkLmiStatus = async (address: string): Promise<any> => {
  console.log('Checking LMI status for address:', address);
  
  try {
    if (!address || address.trim() === '') {
      throw new Error('Address is required');
    }
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('lmi-check', {
      body: { address },
    });
    
    if (error) {
      console.error('Error calling LMI check function:', error);
      throw new Error(error.message || 'Failed to check LMI status');
    }
    
    if (!data) {
      throw new Error('No data returned from LMI check');
    }
    
    console.log('LMI check result:', data);
    
    return data;
  } catch (error) {
    console.error('Error in checkLmiStatus:', error);
    
    // Return a consistent error response
    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
      timestamp: new Date().toISOString(),
      address: address ? address.toUpperCase() : null
    };
  }
};
