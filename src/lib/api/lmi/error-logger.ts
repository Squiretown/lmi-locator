
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Log an error that occurred during an LMI search
 * 
 * @param searchType The type of search (county, zip, tract)
 * @param searchValue The value that was searched for
 * @param error The error that occurred
 * @param searchParams Optional additional search parameters
 * @returns Promise with the result of the logging operation
 */
export const logLmiSearchError = async (
  searchType: 'county' | 'zip' | 'tract',
  searchValue: string,
  error: Error | unknown,
  searchParams?: Record<string, any>
): Promise<{ success: boolean; id?: string }> => {
  try {
    // Extract error details
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Get browser info
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    };
    
    // Create the error log entry
    const { data, error: dbError } = await supabase
      .from('lmi_search_error_logs')
      .insert({
        user_id: supabase.auth.getUser()?.data?.user?.id,
        search_type: searchType,
        search_value: searchValue,
        error_message: errorMessage,
        error_stack: errorStack,
        search_params: searchParams,
        browser_info: JSON.stringify(browserInfo),
        resolved: false,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (dbError) {
      console.error("Failed to log LMI search error:", dbError);
      return { success: false };
    }
    
    console.info("LMI search error logged with ID:", data.id);
    return { success: true, id: data.id };
  } catch (loggingError) {
    console.error("Error in error logging system:", loggingError);
    return { success: false };
  }
};

/**
 * Notify administrators about a critical LMI search error
 * 
 * @param errorId The ID of the logged error
 * @param severity The severity level of the error
 * @returns Promise with the result of the notification operation
 */
export const notifyAdminsOfLmiError = async (
  errorId: string,
  severity: 'low' | 'medium' | 'high' = 'medium'
): Promise<{ success: boolean }> => {
  try {
    // Call edge function to send notification (email, Slack, etc)
    const { error } = await supabase.functions.invoke('notify-admin', {
      body: {
        errorId,
        errorType: 'lmi_search',
        severity
      }
    });
    
    if (error) {
      console.error("Failed to notify admins of LMI error:", error);
      return { success: false };
    }
    
    return { success: true };
  } catch (notifyError) {
    console.error("Error notifying admins:", notifyError);
    return { success: false };
  }
};
