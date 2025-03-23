
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getIncomeCategory } from "./constants.ts";
import { geocodeAddress } from "./geocoder.ts";
import { getMedianIncome } from "./income.ts";
import { corsHeaders, handleCors } from "./cors.ts";

// Main handler function
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    const { address } = await req.json();
    
    if (!address) {
      throw new Error("Address is required");
    }
    
    console.log("Processing LMI check for address:", address);
    
    // Step 1: Geocode the address
    const geocodeResult = await geocodeAddress(address);
    
    if (!geocodeResult.geoid) {
      throw new Error("Unable to determine census tract for address");
    }
    
    // Step 2: Get median income for the tract
    const medianIncome = await getMedianIncome(geocodeResult.geoid);
    
    // Step 3: Calculate eligibility based on AMI
    const ami = 100000; // Area Median Income
    const percentageOfAmi = (medianIncome / ami) * 100;
    const incomeCategory = getIncomeCategory(percentageOfAmi);
    const isEligible = percentageOfAmi <= 80; // LMI eligible if <= 80% of AMI
    
    // Build response
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
      timestamp: new Date().toISOString(),
      data_source: "U.S. Census Bureau American Community Survey 5-Year Estimates"
    };
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in LMI check:", error);
    
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
  const { state, county, tract } = parseGeoId(geoid);
  // Format as SS (state) + CCC (county) + TTTTTT (tract)
  return `${state}${county}${tract}`;
}

function parseGeoId(geoid: string): { state: string, county: string, tract: string } {
  // GEOID format: SSCCCTTTTTT (2-digit state, 3-digit county, 6-digit tract)
  const state = geoid.substring(0, 2);
  const county = geoid.substring(2, 5);
  const tract = geoid.substring(5);
  
  return { state, county, tract };
}
