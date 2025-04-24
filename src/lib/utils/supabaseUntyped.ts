
import { supabase as supabaseClient } from '@/integrations/supabase/client';

/**
 * Untyped wrapper around Supabase to break type inference chains
 */
export const supabaseUntyped = {
  async getClientProfile(userId: string): Promise<any> {
    const fn = new Function('client', 'userId', `
      return client
        .from('client_profiles')
        .select('professional_id')
        .eq('user_id', userId)
        .single();
    `);
    return fn(supabaseClient, userId);
  },
  
  async getProfessional(professionalId: string): Promise<any> {
    const fn = new Function('client', 'professionalId', `
      return client
        .from('professionals')
        .select('*')
        .eq('id', professionalId);
    `);
    return fn(supabaseClient, professionalId);
  }
};
