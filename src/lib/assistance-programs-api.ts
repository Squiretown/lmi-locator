
import { supabase } from "@/integrations/supabase/client";
import { AssistanceProgram, ProgramLocation, PropertyTypeEligible, ProgramEligibilityCheck } from "@/lib/types";

/**
 * Get all assistance programs
 */
export const getAllAssistancePrograms = async (): Promise<AssistanceProgram[]> => {
  try {
    const { data, error } = await supabase
      .from('assistance_programs')
      .select(`
        *,
        program_locations(*),
        property_types_eligible(*)
      `)
      .eq('status', 'active');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching assistance programs:', error);
    return [];
  }
};

/**
 * Get assistance programs by location
 * @param locationType The type of location (state, county, city, etc.)
 * @param locationValue The value of the location (CA, Orange County, etc.)
 */
export const getAssistanceProgramsByLocation = async (
  locationType: string,
  locationValue: string
): Promise<AssistanceProgram[]> => {
  try {
    const { data, error } = await supabase
      .from('assistance_programs')
      .select(`
        *,
        program_locations!inner(*),
        property_types_eligible(*)
      `)
      .eq('status', 'active')
      .eq('program_locations.location_type', locationType)
      .eq('program_locations.location_value', locationValue);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching assistance programs by location:', error);
    return [];
  }
};

/**
 * Save a program eligibility check
 * @param data The eligibility check data
 */
export const saveProgramEligibilityCheck = async (
  data: Partial<ProgramEligibilityCheck>
): Promise<ProgramEligibilityCheck | null> => {
  try {
    const { data: result, error } = await supabase
      .from('program_eligibility_checks')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error saving program eligibility check:', error);
    return null;
  }
};

/**
 * Create a professional lead
 * @param leadData The lead data
 */
export const createProfessionalLead = async (
  leadData: {
    client_name: string;
    email?: string;
    phone?: string;
    property_address?: string;
    property_id?: string;
    notes?: string;
    source?: string;
  }
): Promise<boolean> => {
  try {
    // Get the current user (if authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('professional_leads')
      .insert({
        professional_id: null, // Will be assigned to an available professional
        client_name: leadData.client_name,
        email: leadData.email,
        phone: leadData.phone,
        property_address: leadData.property_address,
        property_id: leadData.property_id,
        status: 'new',
        source: leadData.source || 'website',
        notes: leadData.notes
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating professional lead:', error);
    return false;
  }
};
