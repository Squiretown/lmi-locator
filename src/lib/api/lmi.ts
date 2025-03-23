
// LMI status checking functionality
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Check if a location is in an LMI eligible census tract
export const checkLmiStatus = async (address: string): Promise<any> => {
  console.log('Checking LMI status for address:', address);
  
  try {
    if (!address || address.trim() === '') {
      throw new Error('Address is required');
    }
    
    // First, try using the direct edge function
    try {
      // Call the Supabase Edge Function with configurable timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      const { data, error } = await supabase.functions.invoke('lmi-check', {
        body: { address },
        abortSignal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Error calling LMI check function:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from LMI check');
      }
      
      // Check if the returned data is actually using mock data
      if (data.geocoding_service === "Mock Data") {
        toast.info("Edge function returned mock data");
      } else {
        toast.success("Using real geocoding data");
      }
      
      console.log('LMI check result:', data);
      
      return data;
    } catch (edgeFunctionError) {
      console.error('Edge function failed, attempting alternative approach:', edgeFunctionError);
      
      // Try our fallback geocoding + income approach
      // This would be implemented here, but for now we'll fall back to mock data in development
      if (import.meta.env.DEV) {
        console.warn('Using mock data in development mode due to edge function error');
        const mockResponse = getMockResponse(address);
        toast.info("Using mock data (development fallback)");
        return mockResponse;
      } else {
        // In production, we should retry or use alternative methods
        toast.error("Connection to LMI service failed. Please try again later.");
        throw edgeFunctionError;
      }
    }
  } catch (error) {
    console.error('Error in checkLmiStatus:', error);
    
    // Only fall back to mock data in development mode if there's a serious error
    if (import.meta.env.DEV) {
      console.warn('Using mock data due to error');
      const mockResponse = getMockResponse(address);
      toast.error("Using mock data (error fallback)");
      return mockResponse;
    }
    
    // Return a consistent error response
    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
      timestamp: new Date().toISOString(),
      address: address ? address.toUpperCase() : null
    };
  }
};

// Helper function to provide mock responses for testing
function getMockResponse(address: string) {
  // For testing purposes - addresses containing "low" or "poor" will be LMI eligible
  const isLowIncome = address.toLowerCase().includes('low') || 
                      address.toLowerCase().includes('poor');
  
  // Addresses containing "rich" or "wealth" or "90210" will not be LMI eligible
  const isHighIncome = address.toLowerCase().includes('rich') || 
                       address.toLowerCase().includes('wealth') ||
                       address.toLowerCase().includes('90210');
  
  // Default to moderate income (eligible) if no keywords are present
  const isEligible = isLowIncome || (!isHighIncome);
  
  const medianIncome = isLowIncome ? 30000 : (isHighIncome ? 150000 : 62500);
  const ami = 100000; // Area Median Income
  const percentageOfAmi = (medianIncome / ami) * 100;
  
  let incomeCategory = "";
  if (percentageOfAmi <= 30) incomeCategory = "Extremely Low Income";
  else if (percentageOfAmi <= 50) incomeCategory = "Very Low Income";
  else if (percentageOfAmi <= 80) incomeCategory = "Low Income";
  else if (percentageOfAmi <= 120) incomeCategory = "Moderate Income";
  else incomeCategory = "Above Moderate Income";
  
  // Determine QCT status for mock data
  const isQct = isLowIncome || address.toLowerCase().includes('qct');
  
  return {
    status: "success",
    address: address.toUpperCase(),
    lat: 37.7749,
    lon: -122.4194,
    tract_id: isLowIncome ? "06075010200" : (isHighIncome ? "06037701000" : "06075010800"),
    median_income: medianIncome,
    ami,
    income_category: incomeCategory,
    percentage_of_ami: parseFloat(percentageOfAmi.toFixed(1)),
    eligibility: isEligible ? "Eligible" : "Ineligible",
    color_code: isEligible ? "success" : "danger",
    is_approved: isEligible,
    approval_message: isEligible 
      ? `APPROVED - This location is in a ${incomeCategory} Census Tract`
      : "NOT APPROVED - This location is not in an LMI Census Tract",
    lmi_status: isEligible ? "LMI Eligible" : "Not LMI Eligible",
    is_qct: isQct,
    qct_status: isQct ? "Qualified Census Tract" : "Not a Qualified Census Tract",
    geocoding_service: "Mock Data",
    timestamp: new Date().toISOString(),
    data_source: "MOCK DATA (Development Mode)"
  };
}
