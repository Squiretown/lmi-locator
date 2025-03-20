
// Mock API service since we can't connect to the actual Census API
// In a real implementation, this would connect to the backend APIs

// Mock data for demonstration purposes
const MOCK_RESULTS = {
  eligible: {
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
  },
  ineligible: {
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
  }
};

// Simulated API call with artificial delay
export const checkLmiStatus = async (address: string): Promise<any> => {
  console.log('Checking LMI status for address:', address);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock result based on address content
  if (address.toLowerCase().includes('rich') || 
      address.toLowerCase().includes('wealth') || 
      address.toLowerCase().includes('90210')) {
    return MOCK_RESULTS.ineligible;
  }
  
  return MOCK_RESULTS.eligible;
};

// Geocode an address
export const geocodeAddress = async (address: string): Promise<{lat: number, lon: number}> => {
  console.log('Geocoding address:', address);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock coordinates based on address content
  if (address.toLowerCase().includes('rich') || 
      address.toLowerCase().includes('wealth') || 
      address.toLowerCase().includes('90210')) {
    return { lat: 34.0736, lon: -118.4004 };
  }
  
  return { lat: 37.7749, lon: -122.4194 };
};
