
import { supabase } from "@/integrations/supabase/client";

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    // Use the census-db edge function instead of direct database queries
    const { data, error } = await supabase.functions.invoke('census-db', {
      body: {
        action: 'getDashboardStats',
        params: {}
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    return { success: false, error: error.message };
  }
};
