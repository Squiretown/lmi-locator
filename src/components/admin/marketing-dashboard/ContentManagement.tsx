
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trash, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { 
  getBlogPosts, 
  getTestimonials, 
  getResources,
  BlogPost,
  Testimonial,
  Resource
} from "@/lib/supabase/marketing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const ContentManagement: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: 'blog' | 'testimonial' | 'resource';
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const [blogData, testimonialData, resourceData] = await Promise.all([
        getBlogPosts(),
        getTestimonials(),
        getResources(),
      ]);
      
      setBlogPosts(blogData);
      setTestimonials(testimonialData);
      setResources(resourceData);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type: 'blog' | 'testimonial' | 'resource', id: string, title: string) => {
    setItemToDelete({ type, id, title });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const { type, id } = itemToDelete;
      let tableName = '';
      
      switch (type) {
        case 'blog':
          tableName = 'blog_posts';
          break;
        case 'testimonial':
          tableName = 'testimonials';
          break;
        case 'resource':
          tableName = 'resources';
          break;
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      
      // Refresh the content list
      fetchAllContent();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <Button 
          onClick={fetchAllContent} 
          variant="outline" 
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="blog">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog Posts
            <Badge variant="outline">{blogPosts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Testimonials
            <Badge variant="outline">{testimonials.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Resources
            <Badge variant="outline">{resources.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        {/* Blog Posts Tab */}
        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {blogPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>No blog posts found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">{post.excerpt.substring(0, 100)}...</p>
                            <div className="flex mt-2 text-xs text-muted-foreground space-x-2">
                              <span>{post.author}</span>
                              <span>•</span>
                              <span>{post.category}</span>
                              {post.created_at && (
                                <>
                                  <span>•</span>
                                  <span>{formatDate(post.created_at)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => handleDelete('blog', post.id || '', post.title)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Testimonials Tab */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>Testimonials Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {testimonials.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>No testimonials found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{testimonial.name}</h3>
                              <div className="flex">
                                {Array.from({ length: testimonial.stars }).map((_, i) => (
                                  <span key={i} className="text-yellow-500">★</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm">{testimonial.testimonial.substring(0, 100)}...</p>
                            <div className="flex mt-2 text-xs text-muted-foreground">
                              <span>{testimonial.role} at {testimonial.company}</span>
                              {testimonial.created_at && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{formatDate(testimonial.created_at)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => handleDelete('testimonial', testimonial.id || '', testimonial.name)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {resources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>No resources found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resources.map((resource) => (
                      <div key={resource.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{resource.title}</h3>
                            <p className="text-sm">{resource.description.substring(0, 100)}...</p>
                            <div className="flex mt-2 text-xs text-muted-foreground">
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {resource.url.substring(0, 40)}{resource.url.length > 40 ? '...' : ''}
                              </a>
                              {resource.created_at && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{formatDate(resource.created_at)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => handleDelete('resource', resource.id || '', resource.title)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
