
import { supabase } from "@/integrations/supabase/client";

/**
 * Add a client for a professional user
 * @param clientData Client data
 */
export const addClient = async (clientData: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        professional_id: userId,
        ...clientData
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding client:', error);
    return null;
  }
};

/**
 * Get clients for the current professional user
 */
export const getProfessionalClients = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('professional_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving clients:', error);
    return [];
  }
};
