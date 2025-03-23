
import { supabase } from "@/integrations/supabase/client";

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('searched_at', { ascending: false });
    
    if (error) throw error;
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { count: propertyCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    const { count: realtorCount } = await supabase
      .from('realtors')
      .select('*', { count: 'exact', head: true });
    
    return {
      searchHistory: data,
      userCount,
      propertyCount,
      realtorCount
    };
  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    return { success: false, error: error.message };
  }
};
