
import { corsHeaders } from "./cors.ts";
import { handleSearchBatch } from "./searchOperations.ts";
import { handleGetCachedData, handleSetCachedData } from "./cacheOperations.ts";

// Main handler function for the census-db edge function
export async function handleRequest(req: Request, supabase: any) {
  // Parse request body
  try {
    const body = await req.json();
    const { action, params } = body;
    
    console.log(`Processing action: ${action}`, params);
    
    // Route the request to the appropriate handler based on the action
    let result;
    let error = null;
    try {
      switch (action) {
        case 'searchBatch':
          result = await handleSearchBatch(supabase, params);
          break;
        case 'getCachedData':
          result = await handleGetCachedData(supabase, params);
          break;
        case 'setCachedData':
          result = await handleSetCachedData(supabase, params);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (handlingError) {
      console.error(`Error handling ${action}:`, handlingError);
      
      // Log the error to the database
      try {
        const errorData = {
          action,
          params: JSON.stringify(params),
          error_message: handlingError instanceof Error ? handlingError.message : String(handlingError),
          error_stack: handlingError instanceof Error ? handlingError.stack : undefined,
          created_at: new Date().toISOString()
        };
        
        await supabase
          .from('edge_function_error_logs')
          .insert(errorData);
        
        console.log("Error logged to database");
      } catch (loggingError) {
        console.error("Failed to log error to database:", loggingError);
      }
      
      error = {
        message: handlingError instanceof Error ? handlingError.message : String(handlingError),
        details: handlingError instanceof Error ? handlingError.stack : undefined
      };
    }
    
    // Return the result
    return new Response(
      JSON.stringify(result || { success: false, error }),
      {
        status: error ? 500 : 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Handle parsing errors
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Invalid request format',
          details: error instanceof Error ? error.message : String(error)
        }
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
