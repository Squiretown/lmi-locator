
import { supabase } from "@/integrations/supabase/client";

/**
 * Create a marketing job for address verification
 * @param campaignName Name of the campaign
 * @param addresses Array of addresses to verify
 */
export const createMarketingJob = async (campaignName: string, addresses: string[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    // First create the marketing job
    const { data: jobData, error: jobError } = await supabase
      .from('marketing_jobs')
      .insert({
        user_id: userId,
        campaign_name: campaignName,
        total_addresses: addresses.length,
        status: 'pending'
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Then add all addresses
    const addressObjects = addresses.map(address => ({
      marketing_id: jobData.marketing_id,
      address: address,
      status: 'pending'
    }));

    const { error: addressError } = await supabase
      .from('marketing_addresses')
      .insert(addressObjects);

    if (addressError) throw addressError;

    return jobData;
  } catch (error) {
    console.error('Error creating marketing job:', error);
    return null;
  }
};

/**
 * Get marketing jobs for the current user
 */
export const getUserMarketingJobs = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('marketing_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving marketing jobs:', error);
    return [];
  }
};

/**
 * Blog Post Types and Functions
 */
export interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  created_at?: string;
}

export const createBlogPost = async (blogPost: BlogPost) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No user is logged in');
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...blogPost,
        user_id: userId
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

export const getBlogPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving blog posts:', error);
    return [];
  }
};

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

export const getTestimonials = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving testimonials:', error);
    return [];
  }
};

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

export const getResources = async () => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error retrieving resources:', error);
    return [];
  }
};
