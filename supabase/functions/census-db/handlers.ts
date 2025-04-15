
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
      case 'reportSearchIssue':
        return await handleReportSearchIssue(supabase, params);
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

// Handle user-reported search issues
async function handleReportSearchIssue(supabase: any, params: any) {
  try {
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Insert the reported issue into the database
    const { error } = await supabase
      .from('lmi_search_error_logs')
      .insert({
        search_type: params.searchType || 'unknown',
        search_value: params.searchValue || '',
        error_message: 'User reported issue with search',
        search_params: params,
        created_at: timestamp,
        resolved: false
      });
    
    if (error) throw error;
    
    console.log('Successfully logged user-reported search issue:', params);
    
    return { 
      success: true, 
      message: 'Search issue reported successfully',
      timestamp
    };
  } catch (error) {
    console.error('Error reporting search issue:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
