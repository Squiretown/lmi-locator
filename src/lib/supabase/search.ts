
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Define validation schema for saveSearch parameters
const saveSearchSchema = z.object({
  address: z.string().min(3, "Address must be at least 3 characters"),
  result: z.any().optional(),
  userId: z.string().uuid().optional()
});

/**
 * Saves a property search to the database
 * 
 * @param {string} address - The property address that was searched
 * @param {any} result - The result data from the search
 * @param {string} userId - Optional user ID for authenticated users
 * @returns {Promise<Object>} - Result of the save operation
 */
export const saveSearch = async (address, result = null, userId = null) => {
  try {
    // Validate inputs
    const validatedData = saveSearchSchema.parse({ address, result, userId });
    
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        address: validatedData.address,
        result: validatedData.result,
        user_id: validatedData.userId,
        is_eligible: result?.is_approved || false,
      });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving search:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data', details: error.errors };
    }
    return { success: false, error: error.message };
  }
};

// Define validation schema for getSearchHistory parameters
const getSearchHistorySchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().int().positive().optional().default(20)
});

/**
 * Retrieves search history for a specific user
 * 
 * @param {string} userId - The user ID to get history for
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Object>} - Search history results
 */
export const getSearchHistory = async (userId, limit = 20) => {
  try {
    // Validate inputs
    const validated = getSearchHistorySchema.parse({ userId, limit });
    
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', validated.userId)
      .order('searched_at', { ascending: false })
      .limit(validated.limit);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error retrieving search history:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data', details: error.errors };
    }
    return { success: false, error: error.message };
  }
};

// Define validation schema for getPopularSearches parameter
const popularSearchesSchema = z.object({
  limit: z.number().int().positive().optional().default(5)
});

/**
 * Retrieves the most popular property searches
 * 
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Object>} - Popular searches data
 */
export const getPopularSearches = async (limit = 5) => {
  try {
    // Validate input
    const validated = popularSearchesSchema.parse({ limit });
    
    const { data, error } = await supabase
      .from('search_history')
      .select('address, count(*)')
      .order('count', { ascending: false })
      .group('address')
      .limit(validated.limit);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error retrieving popular searches:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data', details: error.errors };
    }
    return { success: false, error: error.message };
  }
};
