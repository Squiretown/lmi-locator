
import { supabase } from '@/integrations/supabase/client';

export const useProgramEligibilityCheck = () => {
  const checkEligibility = async (
    formData: any, 
    propertyId?: string, 
    searchId?: string
  ) => {
    try {
      // Get user session if available
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Save eligibility check to database
      const { data: eligibilityCheck, error } = await supabase
        .from('program_eligibility_checks')
        .insert({
          user_id: userId,
          search_id: searchId,
          property_id: propertyId,
          first_time_buyer: formData.first_time_buyer,
          military_status: formData.military_status,
          residence_intent: formData.residence_intent,
          timeframe: formData.timeframe,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Find matching programs
      const { data: matchingPrograms, error: programsError } = await supabase
        .from('assistance_programs')
        .select(`
          *,
          program_locations(*),
          property_types_eligible(*)
        `)
        .eq('status', 'active')
        .lte('min_credit_score', 680) // Default value, would normally come from user profile
        .or(`first_time_buyer_required.eq.${formData.first_time_buyer},first_time_buyer_required.eq.false`);
      
      if (programsError) throw programsError;
      
      // Update the eligibility check with matching programs
      if (eligibilityCheck?.id) {
        await supabase
          .from('program_eligibility_checks')
          .update({
            eligible_programs: matchingPrograms
          })
          .eq('id', eligibilityCheck.id);
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

  return { checkEligibility };
};
