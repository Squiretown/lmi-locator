
// LMI status checking functionality
import { geocodeAddress } from './geocode';
import { getMedianIncome } from './income';
import { formatTractId, getIncomeCategory } from './census-helpers';

// Check if a location is in an LMI eligible census tract
export const checkLmiStatus = async (address: string): Promise<any> => {
  console.log('Checking LMI status for address:', address);
  
  try {
    if (!address || address.trim() === '') {
      throw new Error('Address is required');
    }
    
    // Step 1: Geocode the address to get coordinates and census tract
    const geocodeResult = await geocodeAddress(address);
    const { lat, lon, geoid } = geocodeResult;
    
    if (!geoid) {
      throw new Error('Unable to determine census tract for address');
    }
    
    // Step 2: Get median income for the census tract
    const medianIncome = await getMedianIncome(geoid);
    
    if (medianIncome === null || medianIncome === undefined) {
      throw new Error('Unable to retrieve median income data for the census tract');
    }
    
    // Step 3: Calculate percentage of Area Median Income (AMI)
    // For demonstration, we're using a fixed AMI value
    const ami = 100000; // Area Median Income (normally would be retrieved from HUD or calculated)
    const percentageOfAmi = (medianIncome / ami) * 100;
    
    // Step 4: Determine income category and eligibility
    const incomeCategory = getIncomeCategory(percentageOfAmi);
    const isEligible = percentageOfAmi <= 80; // LMI eligible if <= 80% of AMI
    
    // Create the response based on eligibility
    const result = {
      status: "success",
      address: address.toUpperCase(),
      lat,
      lon,
      tract_id: formatTractId(geoid),
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
      timestamp: new Date().toISOString(),
      data_source: "U.S. Census Bureau American Community Survey 5-Year Estimates"
    };
    
    return result;
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
