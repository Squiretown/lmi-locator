
import { supabase } from "@/integrations/supabase/client";

/**
 * Testimonial Types and Functions
 */
export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  company: string;
  testimonial: string;
  stars: number;
  avatar: string;
  created_at?: string;
}

export const createTestimonial = async (testimonial: Testimonial) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        ...testimonial,
        user_id: userId
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Testimonial[];
  } catch (error) {
    console.error('Error retrieving testimonials:', error);
    return [];
  }
};
