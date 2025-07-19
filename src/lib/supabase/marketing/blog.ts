
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
  status?: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
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
        status: blogPost.status || 'published',
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
      imageUrl: post.imageurl,
      status: 'published' as const
    })) as unknown as BlogPost[];
    
    return formattedData;
  } catch (error) {
    console.error('Error retrieving blog posts:', error);
    return [];
  }
};

export const updateBlogPost = async (id: string, blogPost: Partial<BlogPost>) => {
  try {
    const updateData: any = {};
    
    if (blogPost.title) updateData.title = blogPost.title;
    if (blogPost.excerpt) updateData.excerpt = blogPost.excerpt;
    if (blogPost.content) updateData.content = blogPost.content;
    if (blogPost.category) updateData.category = blogPost.category;
    if (blogPost.imageUrl) updateData.imageurl = blogPost.imageUrl;
    if (blogPost.author) updateData.author = blogPost.author;
    if (blogPost.status) updateData.status = blogPost.status;

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating blog post:', error);
    return { success: false, error };
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
