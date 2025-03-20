
// Import required dependencies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Handle check_lmi requests
async function checkLmi(address: string): Promise<any> {
  console.log('Checking LMI status for address:', address);
  
  // In a real implementation, this would call the Census API
  // For now we'll just return mock data based on the address
  
  if (address.toLowerCase().includes('rich') || 
      address.toLowerCase().includes('wealth') || 
      address.toLowerCase().includes('90210')) {
    return MOCK_RESULTS.ineligible;
  }
  
  return MOCK_RESULTS.eligible;
}

// Handle incoming requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if it's a POST request
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'Method not allowed', 
        error_code: 'METHOD_NOT_ALLOWED' 
      }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }

  try {
    // Parse request body
    const requestBody = await req.json();
    const { address } = requestBody;

    // Validate address
    if (!address || typeof address !== 'string') {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Invalid request: address is required', 
          error_code: 'INVALID_REQUEST' 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Process the request
    const result = await checkLmi(address);

    // Return successful response
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'Internal server error', 
        error_code: 'INTERNAL_ERROR' 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
