
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Define validation schema for cacheCensusResult parameters
const cacheCensusSchema = z.object({
  tractId: z.string().min(1, "Tract ID is required"),
  data: z.any(),
  expiresInDays: z.number().int().positive().optional().default(30)
});

/**
 * Caches census data for a specific tract ID to reduce API calls
 * 
 * @param {string} tractId - The census tract ID
 * @param {any} data - The census data to cache
 * @param {number} expiresInDays - Number of days until cache expires
 * @returns {Promise<Object>} - Result of the cache operation
 */
export const cacheCensusResult = async (tractId, data, expiresInDays = 30) => {
  try {
    // Validate inputs
    const validated = cacheCensusSchema.parse({ tractId, data, expiresInDays });
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validated.expiresInDays);
    
    const { data: result, error } = await supabase
      .from('census_cache')
      .upsert({
        tract_id: validated.tractId,
        data: validated.data,
        expires_at: expiresAt.toISOString()
      });
      
    if (error) throw error;
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error caching census result:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data', details: error.errors };
    }
    return { success: false, error: error.message };
  }
};

// Define validation schema for getCachedCensusResult parameter
const getCachedCensusSchema = z.object({
  tractId: z.string().min(1, "Tract ID is required")
});

/**
 * Retrieves cached census data for a specific tract ID
 * 
 * @param {string} tractId - The census tract ID
 * @returns {Promise<Object>} - Cached census data if available
 */
export const getCachedCensusResult = async (tractId) => {
  try {
    // Validate input
    const validated = getCachedCensusSchema.parse({ tractId });
    
    const { data, error } = await supabase
      .from('census_cache')
      .select('*')
      .eq('tract_id', validated.tractId)
      .gt('expires_at', new Date().toISOString())
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found or expired cache
        return { success: true, data: null };
      }
      throw error;
    }
    
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error retrieving cached census result:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data', details: error.errors };
    }
    return { success: false, error: error.message };
  }
};
