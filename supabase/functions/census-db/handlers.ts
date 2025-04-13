
import { corsHeaders } from "./cors.ts";
import { handleSearchBatch } from "./searchOperations.ts";
import { handleGetCachedData, handleSetCachedData } from "./cacheOperations.ts";

// Main handler function for the census-db edge function
export async function handleApiRequest(supabase: any, action: string, params: any) {
  console.log(`Processing API request: ${action}`, params);
  
  try {
    // Route the request to the appropriate handler based on the action
    switch (action) {
      case 'searchBatch':
        return await handleSearchBatch(supabase, params);
      case 'getCachedData':
        return await handleGetCachedData(supabase, params);
      case 'setCachedData':
        return await handleSetCachedData(supabase, params);
      case 'getMedianIncome':
        // Mock income data response for now
        const mockIncome = (params.geoid === '06037701000') ? 150000 : 62500;
        return { 
          success: true,
          medianIncome: mockIncome
        };
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error handling ${action}:`, error);
      
    // Log the error details
    try {
      const errorData = {
        action,
        params: JSON.stringify(params),
        error_message: error instanceof Error ? error.message : String(error),
        error_stack: error instanceof Error ? error.stack : undefined,
        created_at: new Date().toISOString()
      };
      
      await supabase
        .from('edge_function_error_logs')
        .insert(errorData);
      
      console.log("Error logged to database");
    } catch (loggingError) {
      console.error("Failed to log error to database:", loggingError);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
