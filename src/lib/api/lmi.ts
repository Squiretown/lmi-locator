
// LMI status checking functionality
import { geocodeAddress } from './geocode';
import { getMedianIncome } from './income';
import { formatTractId, getIncomeCategory } from './census-helpers';

// Check if a location is in an LMI eligible census tract
export const checkLmiStatus = async (address: string): Promise<any> => {
  console.log('Checking LMI status for address:', address);
  
  try {
    // Step 1: Geocode the address to get coordinates and census tract
    const geocodeResult = await geocodeAddress(address);
    const { lat, lon, geoid } = geocodeResult;
    
    if (!geoid) {
      throw new Error('Unable to determine census tract for address');
    }
    
    // Step 2: Get median income for the census tract
    const medianIncome = await getMedianIncome(geoid);
    
    // Step 3: Calculate percentage of Area Median Income (AMI)
    // For demonstration, we're using a fixed AMI value
    const ami = 100000; // Area Median Income (normally would be retrieved from HUD or calculated)
    const percentageOfAmi = (medianIncome / ami) * 100;
    
    // Step 4: Determine income category and eligibility
    const incomeCategory = getIncomeCategory(percentageOfAmi);
    const isEligible = percentageOfAmi <= 80; // LMI eligible if <= 80% of AMI
    
    // Mock different response types based on eligibility
    const result = isEligible ? {
      status: "success",
      address: address.toUpperCase(),
      lat,
      lon,
      tract_id: formatTractId(geoid),
      median_income: medianIncome,
      ami,
      income_category: incomeCategory,
      percentage_of_ami: parseFloat(percentageOfAmi.toFixed(1)),
      eligibility: "Eligible",
      color_code: "success",
      is_approved: true,
      approval_message: `APPROVED - This location is in a ${incomeCategory} Census Tract`,
      lmi_status: "LMI Eligible",
      timestamp: new Date().toISOString(),
      data_source: "U.S. Census Bureau American Community Survey 5-Year Estimates"
    } : {
      status: "success",
      address: address.toUpperCase(),
      lat,
      lon,
      tract_id: formatTractId(geoid),
      median_income: medianIncome,
      ami,
      income_category: incomeCategory,
      percentage_of_ami: parseFloat(percentageOfAmi.toFixed(1)),
      eligibility: "Ineligible",
      color_code: "danger",
      is_approved: false,
      approval_message: "NOT APPROVED - This location is not in an LMI Census Tract",
      lmi_status: "Not LMI Eligible",
      timestamp: new Date().toISOString(),
      data_source: "U.S. Census Bureau American Community Survey 5-Year Estimates"
    };
    
    return result;
  } catch (error) {
    console.error('Error in checkLmiStatus:', error);
    
    // Return error response
    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
      timestamp: new Date().toISOString()
    };
  }
};
