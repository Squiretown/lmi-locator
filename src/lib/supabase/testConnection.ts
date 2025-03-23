
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Tests the Supabase connection and returns the status
 * 
 * @returns {Promise<boolean>} - True if connection is successful
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Testing Supabase connection...");
    
    // Attempt to ping the database with a simple query
    const start = performance.now();
    
    const { data, error } = await supabase
      .from('system_settings')
      .select('key')
      .limit(1)
      .maybeSingle();
    
    const duration = performance.now() - start;
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      toast.error("Database connection failed");
      return false;
    }
    
    console.log(`Supabase connection successful (${duration.toFixed(2)}ms)`);
    return true;
  } catch (error) {
    console.error("Error testing Supabase connection:", error);
    return false;
  }
};

/**
 * Enhanced error handler for Supabase operations
 * 
 * @param {Error} error - The error object
 * @param {string} operation - The operation that failed
 * @param {boolean} showToast - Whether to show a toast notification
 * @returns {Object} - Standardized error response
 */
export const handleSupabaseError = (error: any, operation: string, showToast = true): { success: false, error: string, details?: any } => {
  // Log detailed error information
  console.error(`Error in Supabase operation [${operation}]:`, error);
  
  // Generate a user-friendly error message
  let errorMessage = "An unexpected error occurred";
  let errorDetails = null;
  
  if (error.code) {
    // Handle known Supabase error codes
    switch (error.code) {
      case "PGRST116":
        errorMessage = "The requested record was not found";
        break;
      case "23505":
        errorMessage = "A duplicate record already exists";
        break;
      case "42P01":
        errorMessage = "Database configuration error: Table not found";
        break;
      case "42703":
        errorMessage = "Database configuration error: Column not found";
        break;
      case "23503":
        errorMessage = "Referenced record does not exist";
        break;
      default:
        errorMessage = `Database error: ${error.message || "Unknown error"}`;
    }
    errorDetails = { code: error.code, hint: error.hint };
  } else if (error.name === 'ZodError') {
    errorMessage = "Input validation failed";
    errorDetails = error.errors;
  } else {
    errorMessage = error.message || "Unknown error occurred";
  }
  
  // Show toast notification if requested
  if (showToast) {
    toast.error(errorMessage);
  }
  
  // Return standardized error response
  return { 
    success: false, 
    error: errorMessage,
    details: errorDetails 
  };
};

export default { testSupabaseConnection, handleSupabaseError };
