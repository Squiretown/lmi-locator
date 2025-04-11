import { supabase } from "@/integrations/supabase/client";

/**
 * Resource Types and Functions
 */
export interface Resource {
  id?: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  created_at?: string;
}

export const createResource = async (resource: Resource) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('resources')
      .insert({
        ...resource,
        user_id: userId
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

export const getResources = async (): Promise<Resource[]> => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Resource[];
  } catch (error) {
    console.error('Error retrieving resources:', error);
    return [];
  }
};

export const deleteResource = async (id: string) => {
  try {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting resource:', error);
    return { success: false, error };
  }
};
