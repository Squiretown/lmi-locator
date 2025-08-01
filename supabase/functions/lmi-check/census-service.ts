
import { geocodeAddress } from "./census/address-geocoder.ts";
import { getIncomeCategory } from "./constants.ts";

/**
 * Check if an address is in a Low-to-Moderate Income (LMI) area using FFIEC data
 * @param address Address to check
 * @param amiValue Area Median Income value to use for comparison (default: 100000)
 * @returns Result of LMI check
 */
export async function checkLmiEligibility(address: string, amiValue: number = 100000) {
  console.log(`Processing LMI eligibility check for address: ${address}`);
  
  try {
    // Step 1: Geocode the address to get census tract
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
    
    // Step 2: Look up FFIEC data for the tract
    console.log("Step 2: Looking up FFIEC data for tract...");
    const ffiecData = await getFFIECTractData(geocodeResult.geoid);
    
    if (!ffiecData) {
      console.warn("No FFIEC data found for tract, falling back to external API...");
      return await checkLmiEligibilityFallback(address, amiValue, geocodeResult);
    }
    
    console.log(`Found FFIEC data:`, ffiecData);
    
    // Step 3: Use FFIEC data to determine LMI eligibility
    const isEligible = ffiecData.is_lmi_eligible;
    const medianIncome = ffiecData.tract_median_family_income || ffiecData.median_income;
    const msaMedianIncome = ffiecData.msa_md_median_income;
    const incomeLevel = ffiecData.income_level;
    
    // Calculate percentage of AMI (use MSA median if available, otherwise use provided AMI)
    const referenceIncome = msaMedianIncome || amiValue;
    const percentageOfAmi = medianIncome ? (medianIncome / referenceIncome) * 100 : null;
    
    console.log(`FFIEC LMI Status: ${isEligible ? "Eligible" : "Not Eligible"}`);
    console.log(`Income Level: ${incomeLevel}`);
    console.log(`Tract Median Income: $${medianIncome}`);
    console.log(`MSA Median Income: $${msaMedianIncome}`);
    
    // Step 4: Format and return the result
    return {
      status: 'success',
      address: address.toUpperCase(),
      lat: geocodeResult.lat,
      lon: geocodeResult.lon,
      tract_id: formatTractId(geocodeResult.geoid),
      ffiec_tract_match: ffiecData.tract_id,
      median_income: medianIncome,
      ami: referenceIncome,
      income_category: incomeLevel || getIncomeCategory(percentageOfAmi || 0),
      percentage_of_ami: percentageOfAmi ? parseFloat(percentageOfAmi.toFixed(1)) : null,
      eligibility: isEligible ? "Eligible" : "Ineligible",
      color_code: isEligible ? "success" : "danger",
      is_approved: isEligible,
      approval_message: isEligible 
        ? `APPROVED - This location is in a ${incomeLevel || 'Low'} Income Census Tract`
        : `NOT APPROVED - This location is in a ${incomeLevel || 'Upper'} Income Census Tract`,
      lmi_status: isEligible ? "LMI Eligible" : "Not LMI Eligible",
      geocoding_service: geocodeResult.geocoding_service || "Census",
      timestamp: new Date().toISOString(),
      data_source: "FFIEC Census Flat File 2025",
      eligibility_details: {
        income_level: incomeLevel,
        tract_median_income: medianIncome,
        msa_median_income: msaMedianIncome,
        income_percentage: percentageOfAmi,
        tract_status: ffiecData.tract_status || null,
        ffiec_data_year: ffiecData.ffiec_data_year || 2025
      }
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
 * Fallback function that uses external APIs when FFIEC data is not available
 */
async function checkLmiEligibilityFallback(address: string, amiValue: number, geocodeResult: any) {
  console.log("Using fallback method with external APIs...");
  
  try {
    // Import the income module here to avoid circular dependencies
    const { getMedianIncome } = await import("./income.ts");
    
    const medianIncome = await getMedianIncome(geocodeResult.geoid);
    
    if (!medianIncome) {
      return {
        status: 'error',
        message: 'Income data unavailable for this location',
        tract_id: formatTractId(geocodeResult.geoid)
      };
    }
    
    const percentageOfAmi = (medianIncome / amiValue) * 100;
    const incomeCategory = getIncomeCategory(percentageOfAmi);
    const isEligible = percentageOfAmi <= 80;
    
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
      data_source: "U.S. Census Bureau American Community Survey 5-Year Estimates (Fallback)"
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get FFIEC data for a census tract from the database
 */
async function getFFIECTractData(geoid: string) {
  console.log(`Looking up FFIEC data for tract: ${geoid}`);
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      return null;
    }
    
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.21.0");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Format the tract ID to match FFIEC format
    const formattedTractId = formatTractIdForFFIEC(geoid);
    console.log(`Formatted tract ID for FFIEC lookup: ${formattedTractId}`);
    
    // Query the census_tracts table for FFIEC data
    const { data, error } = await supabase
      .from('census_tracts')
      .select(`
        tract_id,
        state,
        county,
        tract_name,
        income_level,
        median_income,
        msa_md_median_income,
        tract_median_family_income,
        ami_percentage,
        is_lmi_eligible,
        ffiec_data_year,
        tract_population,
        minority_population_pct,
        owner_occupied_units
      `)
      .eq('tract_id', formattedTractId)
      .maybeSingle();
    
    if (error) {
      console.error("Error querying census_tracts table:", error);
      return null;
    }
    
    if (!data) {
      console.log(`No FFIEC data found for tract: ${formattedTractId}`);
      return null;
    }
    
    console.log(`Found FFIEC data for tract ${formattedTractId}:`, data);
    return data;
  } catch (error) {
    console.error("Error in getFFIECTractData:", error);
    return null;
  }
}

/**
 * Format tract ID to match FFIEC format (11-digit string)
 */
function formatTractIdForFFIEC(geoid: string): string {
  // Remove any non-numeric characters
  const cleanId = geoid.replace(/[^0-9]/g, '');
  
  // FFIEC format: 2-digit state + 3-digit county + 6-digit tract = 11 digits
  if (cleanId.length === 11) {
    return cleanId;
  }
  
  // If it's longer, truncate to 11 digits
  if (cleanId.length > 11) {
    return cleanId.substring(0, 11);
  }
  
  // If it's shorter, pad with zeros on the right (for tract portion)
  return cleanId.padEnd(11, '0');
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
