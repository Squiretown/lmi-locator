
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { checkLmiEligibility, validateAddress } from "./census-service.ts";
import { corsHeaders, handleCors } from "./cors.ts";

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
    const { address, ami } = body;
    
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
    
    console.log("Processing LMI check for address:", address);
    
    // Use the checkLmiEligibility service function
    const result = await checkLmiEligibility(address, ami || 100000);
    
    console.log('Final result:', JSON.stringify(result, null, 2));
    console.log('========== LMI CHECK FUNCTION END (SUCCESS) ==========');
    
    // Determine the appropriate status code based on the result
    const statusCode = result.status === 'error' ? 400 : 200;
    
    return new Response(JSON.stringify(result), {
      status: statusCode,
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
