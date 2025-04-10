
import { supabase } from "@/integrations/supabase/client";

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

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map the results to match our interface
    // Supabase schema uses imageurl but our interface uses imageUrl
    const formattedData = data.map(post => ({
      ...post,
      imageUrl: post.imageurl
    })) as unknown as BlogPost[];
    
    return formattedData;
  } catch (error) {
    console.error('Error retrieving blog posts:', error);
    return [];
  }
};
