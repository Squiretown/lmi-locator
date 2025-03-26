
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { searchLMIByAddress, processLMIData } from "./lmi-data-service.ts";
import { validateAddress } from "../lmi-check/census-service.ts"; // Reuse validation from existing function
import { corsHeaders } from "../lmi-check/cors.ts"; // Reuse CORS helpers

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// Main handler function
serve(async (req) => {
  console.log('========== HUD LMI CHECK FUNCTION START ==========');
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
    const { address, level } = body;
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    if (!address) {
      console.error('Address is required but was not provided');
      return new Response(JSON.stringify({
        status: "error",
        message: "Address is required"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Validate address format
    if (!validateAddress(address)) {
      console.warn(`Invalid address format: ${address}`);
      return new Response(JSON.stringify({
        status: "error",
        message: "Invalid address format. Please provide a complete street address."
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("Processing HUD LMI check for address:", address);
    
    // Parse the address into components
    const addressParts = parseAddressString(address);
    if (!addressParts) {
      return new Response(JSON.stringify({
        status: "error",
        message: "Could not parse address components"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Search LMI by address
    const searchLevel = level === 'blockGroup' ? 'blockGroup' : 'tract';
    const lmiData = await searchLMIByAddress(addressParts, searchLevel);
    
    // Process the results
    const result = processLMIData(lmiData);
    
    // Format the response
    const response = {
      status: "success",
      address: address.toUpperCase(),
      lat: result.addressInfo?.coordinates.latitude,
      lon: result.addressInfo?.coordinates.longitude,
      tract_id: result.geographyId,
      hud_low_mod_percent: result.lowModPercent,
      hud_low_mod_population: result.lowModPopulation,
      is_lmi_qualified: result.isLMI,
      state: result.state,
      county: result.county,
      geography_type: result.geographyType,
      data_source: "HUD Low-to-Moderate Income (LMI) Summary Data",
      eligibility: result.isLMI ? "Eligible" : "Ineligible",
      color_code: result.isLMI ? "success" : "danger",
      is_approved: result.isLMI,
      approval_message: result.isLMI 
        ? `APPROVED - This location qualifies as LMI area (${result.lowModPercent}% LMI population)`
        : `NOT APPROVED - This location does not qualify as LMI area (${result.lowModPercent}% LMI population)`,
      timestamp: new Date().toISOString()
    };
    
    console.log('Final result:', JSON.stringify(response, null, 2));
    console.log('========== HUD LMI CHECK FUNCTION END (SUCCESS) ==========');
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in HUD LMI check:", error);
    console.error("Error stack:", error.stack);
    
    console.log('========== HUD LMI CHECK FUNCTION END (ERROR) ==========');
    
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

/**
 * Parse a full address string into separate components
 * @param address Full address string (e.g. "123 Main St, Anytown, CA 12345")
 * @returns Object with address components or null if parsing failed
 */
function parseAddressString(address: string) {
  // Clean and format the address
  address = address.trim().replace(/\s+/g, ' ');
  
  // Handle different address formats
  let street, city, state, zip;
  
  // Try to match common address formats
  const addressRegex = /^(.*?),\s*(.*?),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/i;
  const match = address.match(addressRegex);
  
  if (match) {
    // Format: "123 Main St, Anytown, CA 12345"
    [, street, city, state, zip] = match;
  } else {
    // Try another common format
    const altRegex = /^(.*?),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/i;
    const altMatch = address.match(altRegex);
    
    if (altMatch) {
      // Format: "123 Main St, CA 12345"
      [, street, state, zip] = altMatch;
      city = ""; // No city provided
    } else {
      // Simple fallback: try to find state code
      const stateMatch = address.match(/\b([A-Z]{2})\b/i);
      if (stateMatch) {
        state = stateMatch[1];
        const parts = address.split(',').map(p => p.trim());
        
        if (parts.length >= 2) {
          street = parts[0];
          // Try to extract city
          const cityStateZip = parts[1].split(/\s+/);
          if (cityStateZip.length > 2) {
            city = cityStateZip.slice(0, -2).join(' ');
            zip = cityStateZip[cityStateZip.length - 1];
          } else {
            city = parts[1].replace(stateMatch[0], '').trim();
          }
        } else {
          // Can't reliably parse
          return null;
        }
      } else {
        // Can't find state code
        return null;
      }
    }
  }
  
  return { street, city, state, zip };
}
