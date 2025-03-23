
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Client } from "@/lib/types/user-models";

// Define validation schema for addClient parameters
const addClientSchema = z.object({
  professionalId: z.string().uuid("Invalid professional ID"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  notes: z.string().optional()
});

/**
 * Adds a new client to a professional's client list
 * 
 * @param {Object} clientData - Client data including first name, last name, etc.
 * @param {string} professionalId - ID of the professional adding the client
 * @returns {Promise<Object>} - Result of the add operation
 */
export const addClient = async (clientData, professionalId) => {
  try {
    // Validate inputs
    const validated = addClientSchema.parse({
      professionalId,
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email,
      phone: clientData.phone,
      notes: clientData.notes
    });
    
    const { data, error } = await supabase
      .from('clients')
      .insert({
        professional_id: validated.professionalId,
        first_name: validated.firstName,
        last_name: validated.lastName,
        email: validated.email,
        phone: validated.phone,
        notes: validated.notes,
        status: 'active'
      });
      
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

// Define validation schema for getProfessionalClients parameter
const getProfessionalClientsSchema = z.object({
  professionalId: z.string().uuid("Invalid professional ID"),
  limit: z.number().int().positive().optional().default(50)
});

/**
 * Retrieves all clients for a specific professional
 * 
 * @param {string} professionalId - ID of the professional
 * @param {number} limit - Maximum number of clients to return
 * @returns {Promise<Object>} - List of clients
 */
export const getProfessionalClients = async (professionalId, limit = 50) => {
  try {
    // Validate inputs
    const validated = getProfessionalClientsSchema.parse({ professionalId, limit });
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('professional_id', validated.professionalId)
      .order('last_name', { ascending: true })
      .limit(validated.limit);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error retrieving professional clients:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data', details: error.errors };
    }
    return { success: false, error: error.message };
  }
};
