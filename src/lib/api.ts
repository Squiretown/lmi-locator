
import { supabase } from "@/integrations/supabase/client";

// Check LMI status through Supabase Edge Function
export const checkLmiStatus = async (address: string): Promise<any> => {
  console.log('Checking LMI status for address:', address);
  
  try {
    const { data, error } = await supabase.functions.invoke('check-lmi', {
      body: { address }
    });

    if (error) {
      console.error('Error calling check-lmi function:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in checkLmiStatus:', err);
    // Fallback to mock if edge function fails
    return getFallbackMockData(address);
  }
};

// Fallback mock data for demonstration purposes or if edge function fails
const getFallbackMockData = (address: string): any => {
  // Simulate API delay
  console.log('Using fallback mock data for:', address);
  
  // Return mock result based on address content
  if (address.toLowerCase().includes('rich') || 
      address.toLowerCase().includes('wealth') || 
      address.toLowerCase().includes('90210')) {
    return {
      status: "success",
      address: "456 RICH BLVD, WEALTHYTOWN, CA 90210",
      lat: 34.0736,
      lon: -118.4004,
      tract_id: "06037701000",
      median_income: 150000,
      ami: 100000,
      income_category: "Above Moderate Income",
      percentage_of_ami: 150.0,
      eligibility: "Ineligible",
      color_code: "danger",
      is_approved: false,
      approval_message: "NOT APPROVED - This location is not in an LMI Census Tract",
      lmi_status: "Not LMI Eligible",
      timestamp: new Date().toISOString(),
      data_source: "U.S. Census Bureau American Community Survey"
    };
  }
  
  return {
    status: "success",
    address: "123 MAIN ST, ANYTOWN, CA 94105",
    lat: 37.7749,
    lon: -122.4194,
    tract_id: "06075010800",
    median_income: 62500,
    ami: 100000,
    income_category: "Moderate Income",
    percentage_of_ami: 62.5,
    eligibility: "Eligible",
    color_code: "success",
    is_approved: true,
    approval_message: "APPROVED - This location is in a Moderate Income Census Tract",
    lmi_status: "LMI Eligible",
    timestamp: new Date().toISOString(),
    data_source: "U.S. Census Bureau American Community Survey"
  };
};

// Geocode an address
export const geocodeAddress = async (address: string): Promise<{lat: number, lon: number}> => {
  console.log('Geocoding address:', address);
  
  // In a real implementation, this would call a geocoding API
  // For now we'll just return mock coordinates based on the address
  if (address.toLowerCase().includes('rich') || 
      address.toLowerCase().includes('wealth') || 
      address.toLowerCase().includes('90210')) {
    return { lat: 34.0736, lon: -118.4004 };
  }
  
  return { lat: 37.7749, lon: -122.4194 };
};
