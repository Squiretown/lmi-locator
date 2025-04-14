
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Define validation schema for addClient parameters
const clientSchema = z.object({
  professionalId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.string().optional().default('active'),
  notes: z.string().optional()
});

// Define type for options parameter
interface QueryOptions {
  limit?: number;
  status?: string;
}

/**
 * Adds a new client for a professional
 * 
 * @param {Object} clientData - Client information
 * @returns {Promise<Object>} - Result of the operation
 */
export const addClient = async (clientData) => {
  try {
    // Validate inputs
    const validatedData = clientSchema.parse(clientData);
    
    const { data, error } = await supabase
      .from('client_profiles')
      .insert({
        professional_id: validatedData.professionalId,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        status: validatedData.status,
        notes: validatedData.notes
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error adding client:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data', details: error.errors };
    }
    return { success: false, error: error.message };
  }
};

/**
 * Gets clients for a professional
 * 
 * @param {string} professionalId - The professional's ID
 * @param {QueryOptions} options - Query options (limit, filter, etc.)
 * @returns {Promise<Object>} - Result with client data
 */
export const getProfessionalClients = async (professionalId, options: QueryOptions = {}) => {
  try {
    const limit = options.limit || 100;
    const status = options.status || null;
    
    let query = supabase
      .from('client_profiles')
      .select('*')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting clients:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets saved properties for a user
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result with saved properties data
 */
export const getSavedProperties = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        id,
        address,
        notes,
        created_at,
        is_favorite,
        folder,
        property_id,
        properties:property_id (
          address,
          price,
          bedrooms,
          bathrooms,
          square_feet,
          is_lmi_eligible,
          lmi_data
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error getting saved properties:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Saves a property for a user
 * 
 * @param {Object} propertyData - Property information
 * @returns {Promise<Object>} - Result of the operation
 */
export const saveProperty = async (propertyData) => {
  try {
    const { userId, address, propertyId = null, isFavorite = false, notes = '', folder = 'default' } = propertyData;
    
    const { data, error } = await supabase
      .from('saved_properties')
      .insert({
        user_id: userId,
        address,
        property_id: propertyId,
        is_favorite: isFavorite,
        notes,
        folder
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving property:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Removes a saved property
 * 
 * @param {string} propertyId - The saved property ID to remove
 * @returns {Promise<Object>} - Result of the operation
 */
export const removeSavedProperty = async (propertyId) => {
  try {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('id', propertyId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error removing saved property:', error);
    return { success: false, error: error.message };
  }
};
