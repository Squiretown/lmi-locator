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

    // Transform the blogPost object to match the database column names
    // The database uses 'imageurl' (lowercase) but our interface uses 'imageUrl'
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: blogPost.title,
        excerpt: blogPost.excerpt,
        content: blogPost.content,
        category: blogPost.category,
        imageurl: blogPost.imageUrl, // Convert imageUrl to imageurl
        author: blogPost.author,
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

export const deleteBlogPost = async (id: string) => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return { success: false, error };
  }
};
