
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getIncomeCategory } from "./constants.ts";
import { geocodeAddress } from "./geocoder.ts";
import { getMedianIncome } from "./income.ts";
import { corsHeaders, handleCors } from "./cors.ts";
import { getQctStatus } from "./qct.ts";

// Main handler function
serve(async (req) => {
  console.log('========== LMI CHECK FUNCTION START ==========');
  console.log('Request received:', req.method, req.url);
  
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    console.log('Returning CORS preflight response');
    return corsResponse;
  }

  try {
    // Parse request body
    console.log('Parsing request body...');
    const body = await req.json();
    const { address } = body;
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    if (!address) {
      console.error('Address is required but was not provided');
      throw new Error("Address is required");
    }
    
    console.log("Processing LMI check for address:", address);
    
    // Step 1: Geocode the address
    console.log('Step 1: Geocoding address...');
    const geocodeResult = await geocodeAddress(address);
    console.log('Geocode result:', JSON.stringify(geocodeResult, null, 2));
    
    if (!geocodeResult.geoid) {
      console.error('Unable to determine census tract for address');
      throw new Error("Unable to determine census tract for address");
    }
    
    // Step 2: Get median income for the tract
    console.log('Step 2: Getting median income for tract...');
    const medianIncome = await getMedianIncome(geocodeResult.geoid);
    console.log('Median income result:', medianIncome);
    
    // Step 3: Calculate eligibility based on AMI
    console.log('Step 3: Calculating eligibility...');
    const ami = 100000; // Area Median Income
    const percentageOfAmi = (medianIncome / ami) * 100;
    const incomeCategory = getIncomeCategory(percentageOfAmi);
    const isEligible = percentageOfAmi <= 80; // LMI eligible if <= 80% of AMI
    
    console.log('Eligibility calculation:', {
      ami,
      percentageOfAmi,
      incomeCategory,
      isEligible
    });
    
    // Step 4: Get QCT status (Qualified Census Tract)
    console.log('Step 4: Getting QCT status...');
    const qctStatus = await getQctStatus(geocodeResult.geoid);
    console.log('QCT status result:', JSON.stringify(qctStatus, null, 2));
    
    // Build response
    console.log('Building response...');
    const result = {
      status: "success",
      address: address.toUpperCase(),
      lat: geocodeResult.lat,
      lon: geocodeResult.lon,
      tract_id: formatTractId(geocodeResult.geoid),
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
      is_qct: qctStatus.isQct,
      qct_status: qctStatus.isQct ? "Qualified Census Tract" : "Not a Qualified Census Tract",
      qct_info: qctStatus.details || null,
      geocoding_service: geocodeResult.geocoding_service || "Census",
      timestamp: new Date().toISOString(),
      data_source: "U.S. Census Bureau American Community Survey 5-Year Estimates"
    };
    
    console.log('Final result:', JSON.stringify(result, null, 2));
    console.log('========== LMI CHECK FUNCTION END (SUCCESS) ==========');
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in LMI check:", error);
    console.error("Error stack:", error.stack);
    
    console.log('========== LMI CHECK FUNCTION END (ERROR) ==========');
    
    return new Response(JSON.stringify({
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper functions
function formatTractId(geoid: string): string {
  console.log('Formatting tract ID from geoid:', geoid);
  const { state, county, tract } = parseGeoId(geoid);
  // Format as SS (state) + CCC (county) + TTTTTT (tract)
  const formattedId = `${state}${county}${tract}`;
  console.log('Formatted tract ID:', formattedId);
  return formattedId;
}

function parseGeoId(geoid: string): { state: string, county: string, tract: string } {
  // GEOID format: SSCCCTTTTTT (2-digit state, 3-digit county, 6-digit tract)
  const state = geoid.substring(0, 2);
  const county = geoid.substring(2, 5);
  const tract = geoid.substring(5);
  
  return { state, county, tract };
}
