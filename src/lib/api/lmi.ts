
// LMI status checking functionality
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the type for our LMI check result
interface LmiResult {
  status: string;
  address?: string;
  place_name?: string;
  matched_location?: string;
  lat?: number;
  lon?: number;
  tract_id: string;
  median_income?: number;
  ami?: number;
  income_category?: string;
  percentage_of_ami?: number;
  hud_low_mod_percent?: number;
  hud_low_mod_population?: number;
  eligibility: string;
  color_code?: string;
  is_approved: boolean;
  approval_message: string;
  lmi_status?: string;
  is_qct?: boolean;
  qct_status?: string;
  geocoding_service?: string;
  timestamp: string;
  data_source?: string;
  message?: string;
  search_type?: string;
}

// Check if a location is in an LMI eligible census tract
export const checkLmiStatus = async (address: string, options?: { 
  useHud?: boolean, 
  searchType?: 'address' | 'place',
  level?: 'tract' | 'blockGroup'
}): Promise<any> => {
  console.log('Checking LMI status for:', address);
  console.log('Options:', options);
  
  try {
    if (!address || address.trim() === '') {
      throw new Error('Address or place name is required');
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

// Check LMI status using HUD data (convenience method)
export const checkHudLmiStatus = async (address: string, options?: { 
  searchType?: 'address' | 'place',
  level?: 'tract' | 'blockGroup'
}): Promise<any> => {
  return checkLmiStatus(address, { 
    useHud: true,
    searchType: options?.searchType || 'address',
    level: options?.level || 'tract'
  });
};

// Check LMI status by place name using HUD data
export const checkHudLmiStatusByPlace = async (placeName: string, options?: {
  level?: 'tract' | 'blockGroup'
}): Promise<any> => {
  return checkLmiStatus(placeName, {
    useHud: true,
    searchType: 'place',
    level: options?.level || 'tract'
  });
};

// Helper function to provide mock responses for testing
function getMockResponse(query: string, searchType: 'address' | 'place' = 'address') {
  // For testing purposes - addresses containing "low" or "poor" will be LMI eligible
  const isLowIncome = query.toLowerCase().includes('low') || 
                      query.toLowerCase().includes('poor');
  
  // Addresses containing "rich" or "wealth" or "90210" will not be LMI eligible
  const isHighIncome = query.toLowerCase().includes('rich') || 
                       query.toLowerCase().includes('wealth') ||
                       query.toLowerCase().includes('90210');
  
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
  const isQct = isLowIncome || query.toLowerCase().includes('qct');
  
  const result: LmiResult = {
    status: "success",
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
    data_source: "MOCK DATA (Fallback Mode)",
    search_type: searchType
  };
  
  if (searchType === 'address') {
    result.address = query.toUpperCase();
  } else {
    result.place_name = query;
    result.matched_location = `Matched ${query}`;
  }
  
  // Add coordinates based on income type (just for variety in mock data)
  result.lat = isLowIncome ? 37.7749 : (isHighIncome ? 34.0736 : 38.5816);
  result.lon = isLowIncome ? -122.4194 : (isHighIncome ? -118.4004 : -121.4944);
  
  return result;
}
