
import { supabase } from '@/integrations/supabase/client';
import { formatAddress } from '@/components/specialist-connect/utils/addressUtils';

/**
 * Save an eligibility check to the database and find matching programs
 */
export const checkEligibility = async (
  formData: any, 
  propertyId?: string, 
  searchId?: string
) => {
  try {
    // Get user session if available
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Clean any address that might be stored with the eligibility check
    const propertyAddress = formData.property_address ? formatAddress(formData.property_address) : undefined;
    
    // Save eligibility check to database
    const { data: eligibilityCheck, error } = await supabase
      .from('program_eligibility_checks')
      .insert({
        user_id: userId,
        search_id: searchId,
        property_id: propertyId,
        property_address: propertyAddress,
        first_time_buyer: formData.first_time_buyer,
        military_status: formData.military_status,
        residence_intent: formData.residence_intent,
        timeframe: formData.timeframe,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Find matching programs
    const matchingPrograms = await findMatchingPrograms(formData);
    
    // Update the eligibility check with matching programs
    if (eligibilityCheck?.id) {
      await updateEligibilityCheckWithPrograms(eligibilityCheck.id, matchingPrograms);
    }
    
    return {
      eligibilityCheck,
      matchingPrograms
    };
  } catch (error) {
    console.error('Error during eligibility check:', error);
    throw error;
  }
};

/**
 * Find assistance programs that match the user's criteria
 */
const findMatchingPrograms = async (formData: any) => {
  try {
    const { data: matchingPrograms, error } = await supabase
      .from('assistance_programs')
      .select(`
        *,
        program_locations(*),
        property_types_eligible(*)
      `)
      .eq('status', 'active')
      .lte('min_credit_score', 680) // Default value, would normally come from user profile
      .or(`first_time_buyer_required.eq.${formData.first_time_buyer},first_time_buyer_required.eq.false`);
    
    if (error) throw error;
    
    return matchingPrograms || [];
  } catch (error) {
    console.error('Error finding matching programs:', error);
    throw error;
  }
};

/**
 * Update an eligibility check with matching programs
 */
const updateEligibilityCheckWithPrograms = async (eligibilityCheckId: string, matchingPrograms: any[]) => {
  try {
    await supabase
      .from('program_eligibility_checks')
      .update({
        eligible_programs: matchingPrograms
      })
      .eq('id', eligibilityCheckId);
  } catch (error) {
    console.error('Error updating eligibility check with programs:', error);
    // We'll log the error but not throw it so the overall process can continue
  }
};
