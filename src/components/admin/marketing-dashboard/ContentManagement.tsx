
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, FileText, MessageSquare, BookOpen, PenSquare } from "lucide-react";
import { getBlogPosts, getTestimonials, getResources, deleteBlogPost, deleteTestimonial, deleteResource } from "@/lib/supabase/marketing";
import { toast } from 'sonner';
import { BlogPost, Testimonial, Resource } from '@/lib/supabase/marketing';

export const ContentManagement: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState({
    blogs: false,
    testimonials: false,
    resources: false
  });
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    // Fetch blog posts
    setLoading(prev => ({ ...prev, blogs: true }));
    try {
      const posts = await getBlogPosts();
      setBlogPosts(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(prev => ({ ...prev, blogs: false }));
    }

    // Fetch testimonials
    setLoading(prev => ({ ...prev, testimonials: true }));
    try {
      const testims = await getTestimonials();
      setTestimonials(testims);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(prev => ({ ...prev, testimonials: false }));
    }

    // Fetch resources
    setLoading(prev => ({ ...prev, resources: true }));
    try {
      const res = await getResources();
      setResources(res);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(prev => ({ ...prev, resources: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteBlogPost = async (id: string) => {
    if (!id) return;
    
    setDeleting(prev => ({ ...prev, [`blog_${id}`]: true }));
    try {
      const result = await deleteBlogPost(id);
      if (result.success) {
        toast.success('Blog post deleted successfully');
        setBlogPosts(prev => prev.filter(post => post.id !== id));
      } else {
        toast.error('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('An error occurred while deleting the blog post');
    } finally {
      setDeleting(prev => ({ ...prev, [`blog_${id}`]: false }));
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!id) return;
    
    setDeleting(prev => ({ ...prev, [`testimonial_${id}`]: true }));
    try {
      const result = await deleteTestimonial(id);
      if (result.success) {
        toast.success('Testimonial deleted successfully');
        setTestimonials(prev => prev.filter(t => t.id !== id));
      } else {
        toast.error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('An error occurred while deleting the testimonial');
    } finally {
      setDeleting(prev => ({ ...prev, [`testimonial_${id}`]: false }));
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!id) return;
    
    setDeleting(prev => ({ ...prev, [`resource_${id}`]: true }));
    try {
      const result = await deleteResource(id);
      if (result.success) {
        toast.success('Resource deleted successfully');
        setResources(prev => prev.filter(r => r.id !== id));
      } else {
        toast.error('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('An error occurred while deleting the resource');
    } finally {
      setDeleting(prev => ({ ...prev, [`resource_${id}`]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="blog">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="blog" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>
        
        {/* Blog Posts Tab */}
        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Blog Post Management</CardTitle>
              <CardDescription>Manage existing blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.blogs ? (
                  <p className="text-center py-4">Loading blog posts...</p>
                ) : blogPosts.length === 0 ? (
                  <p className="text-center py-4">No blog posts found. Create your first post from the "Create Content" tab.</p>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map(post => (
                      <div key={post.id} className="border rounded-md p-4 flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{post.title}</h3>
                          <p className="text-muted-foreground text-sm">By {post.author} in {post.category}</p>
                          <p className="mt-2 text-sm line-clamp-2">{post.excerpt}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteBlogPost(post.id || '')}
                          disabled={deleting[`blog_${post.id}`]}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Testimonials Tab */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Testimonial Management</CardTitle>
              <CardDescription>Manage existing testimonials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.testimonials ? (
                  <p className="text-center py-4">Loading testimonials...</p>
                ) : testimonials.length === 0 ? (
                  <p className="text-center py-4">No testimonials found. Create your first testimonial from the "Create Content" tab.</p>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map(testimonial => (
                      <div key={testimonial.id} className="border rounded-md p-4 flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{testimonial.name}</h3>
                          <p className="text-muted-foreground text-sm">{testimonial.role} at {testimonial.company}</p>
                          <div className="mt-1 mb-2">
                            {"★".repeat(testimonial.stars)}{"☆".repeat(5 - testimonial.stars)}
                          </div>
                          <p className="mt-2 text-sm line-clamp-2">{testimonial.testimonial}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteTestimonial(testimonial.id || '')}
                          disabled={deleting[`testimonial_${testimonial.id}`]}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Resource Management</CardTitle>
              <CardDescription>Manage existing resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.resources ? (
                  <p className="text-center py-4">Loading resources...</p>
                ) : resources.length === 0 ? (
                  <p className="text-center py-4">No resources found. Create your first resource from the "Create Content" tab.</p>
                ) : (
                  <div className="space-y-4">
                    {resources.map(resource => (
                      <div key={resource.id} className="border rounded-md p-4 flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{resource.title}</h3>
                          <p className="text-blue-600 hover:underline text-sm">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a>
                          </p>
                          <p className="mt-2 text-sm line-clamp-2">{resource.description}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteResource(resource.id || '')}
                          disabled={deleting[`resource_${resource.id}`]}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
