
import { determineCensusTract } from "./census/tract-finder.ts";
import { geocodeAddress } from "./census/address-geocoder.ts";
import { getMedianIncome } from "./income.ts";
import { getIncomeCategory } from "./constants.ts";

/**
 * Check if an address is in a Low-to-Moderate Income (LMI) area
 * @param address Address to check
 * @param amiValue Area Median Income value to use for comparison (default: 100000)
 * @returns Result of LMI check
 */
export async function checkLmiEligibility(address: string, amiValue: number = 100000) {
  console.log(`Processing LMI eligibility check for address: ${address}`);
  
  try {
    // Step 1: Geocode the address
    console.log("Step 1: Geocoding address...");
    const geocodeResult = await geocodeAddress(address);
    
    if (!geocodeResult.geoid) {
      console.error("Failed to find census tract during geocoding");
      return {
        status: 'error',
        message: 'Census tract not found for this location',
        lat: geocodeResult.lat,
        lon: geocodeResult.lon,
        geocoding_service: geocodeResult.geocoding_service
      };
    }
    
    console.log(`Successfully geocoded to coordinates: ${geocodeResult.lat}, ${geocodeResult.lon}`);
    console.log(`Identified census tract: ${geocodeResult.geoid}`);
    
    // Step 2: Get income data for the tract
    console.log("Step 2: Getting median income data...");
    const medianIncome = await getMedianIncome(geocodeResult.geoid);
    
    if (!medianIncome) {
      console.error("Failed to retrieve median income data");
      return {
        status: 'error',
        message: 'Income data unavailable for this location',
        tract_id: formatTractId(geocodeResult.geoid)
      };
    }
    
    console.log(`Retrieved median income: $${medianIncome}`);
    
    // Step 3: Calculate eligibility based on AMI
    console.log("Step 3: Calculating eligibility...");
    const percentageOfAmi = (medianIncome / amiValue) * 100;
    const incomeCategory = getIncomeCategory(percentageOfAmi);
    const isEligible = percentageOfAmi <= 80; // LMI eligible if <= 80% of AMI
    
    console.log(`AMI Percentage: ${percentageOfAmi.toFixed(1)}%`);
    console.log(`Income Category: ${incomeCategory}`);
    console.log(`LMI Eligibility: ${isEligible ? "Eligible" : "Not Eligible"}`);
    
    // Step 4: Format and return the result
    return {
      status: 'success',
      address: address.toUpperCase(),
      lat: geocodeResult.lat,
      lon: geocodeResult.lon,
      tract_id: formatTractId(geocodeResult.geoid),
      median_income: medianIncome,
      ami: amiValue,
      income_category: incomeCategory,
      percentage_of_ami: parseFloat(percentageOfAmi.toFixed(1)),
      eligibility: isEligible ? "Eligible" : "Ineligible",
      color_code: isEligible ? "success" : "danger",
      is_approved: isEligible,
      approval_message: isEligible 
        ? `APPROVED - This location is in a ${incomeCategory} Census Tract`
        : "NOT APPROVED - This location is not in an LMI Census Tract",
      lmi_status: isEligible ? "LMI Eligible" : "Not LMI Eligible",
      geocoding_service: geocodeResult.geocoding_service || "Census",
      timestamp: new Date().toISOString(),
      data_source: "U.S. Census Bureau American Community Survey 5-Year Estimates"
    };
  } catch (error) {
    console.error(`Unexpected error in checkLmiEligibility: ${error}`);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Validate an address format
 * @param address Address to validate
 * @returns Boolean indicating if address is valid
 */
export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Remove extra whitespace
  address = address.replace(/\s+/g, ' ').trim();

  // Basic address validation
  const requiredComponents = [
    // At least one number (street number)
    (x: string) => /\d/.test(x),
    // Minimum length for a reasonable address
    (x: string) => x.trim().length >= 10,
    // Contains street identifier
    (x: string) => /street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|place|pl|court|ct|circle|cir|terrace|ter|highway|hwy/i.test(x)
  ];

  return requiredComponents.every(check => check(address));
}

// Helper function to format tract ID
function formatTractId(geoid: string): string {
  // Extract the components from the GEOID
  // GEOID format: SSCCCTTTTTT (2-digit state, 3-digit county, 6-digit tract)
  const state = geoid.substring(0, 2);
  const county = geoid.substring(2, 5);
  const tract = geoid.substring(5);
  
  // Format as standard Census tract ID
  return `${state}${county}${tract}`;
}
