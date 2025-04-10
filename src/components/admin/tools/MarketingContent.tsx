
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Plus, 
  Trash, 
  Save, 
  Image,
  RefreshCw,
  CheckCircle,
  X
} from "lucide-react";
import { createBlogPost, createResource, createTestimonial, getBlogPosts, getResources, getTestimonials } from "@/lib/supabase/marketing";

// Blog Post Form
const BlogPostForm = () => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Education');
  const [imageUrl, setImageUrl] = useState('/placeholder.svg');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createBlogPost({
        title,
        excerpt,
        content,
        category,
        imageUrl,
        author
      });
      
      toast.success('Blog post created successfully');
      // Reset form
      setTitle('');
      setExcerpt('');
      setContent('');
      setCategory('Education');
      setImageUrl('/placeholder.svg');
      setAuthor('');
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Blog post title" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input 
            id="author" 
            value={author} 
            onChange={(e) => setAuthor(e.target.value)} 
            placeholder="Author name" 
            required 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Community">Community</SelectItem>
              <SelectItem value="Investment">Investment</SelectItem>
              <SelectItem value="Policy">Policy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input 
            id="imageUrl" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            placeholder="Image URL" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea 
          id="excerpt" 
          value={excerpt} 
          onChange={(e) => setExcerpt(e.target.value)} 
          placeholder="Brief summary of the post" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea 
          id="content" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Full blog post content" 
          required 
          className="min-h-[200px]" 
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="reset" variant="outline" onClick={() => {
          setTitle('');
          setExcerpt('');
          setContent('');
          setCategory('Education');
          setImageUrl('/placeholder.svg');
          setAuthor('');
        }}>
          Clear
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Post
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Testimonials Form
const TestimonialForm = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [stars, setStars] = useState('5');
  const [avatar, setAvatar] = useState('/placeholder.svg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createTestimonial({
        name,
        role,
        company,
        testimonial,
        stars: parseInt(stars),
        avatar
      });
      
      toast.success('Testimonial created successfully');
      // Reset form
      setName('');
      setRole('');
      setCompany('');
      setTestimonial('');
      setStars('5');
      setAvatar('/placeholder.svg');
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast.error('Failed to create testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Customer name" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input 
            id="avatar" 
            value={avatar} 
            onChange={(e) => setAvatar(e.target.value)} 
            placeholder="Avatar image URL" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input 
            id="role" 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            placeholder="Job title" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input 
            id="company" 
            value={company} 
            onChange={(e) => setCompany(e.target.value)} 
            placeholder="Company name" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stars">Rating (1-5)</Label>
          <Select value={stars} onValueChange={setStars}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Star</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="testimonial">Testimonial</Label>
        <Textarea 
          id="testimonial" 
          value={testimonial} 
          onChange={(e) => setTestimonial(e.target.value)} 
          placeholder="Customer testimonial" 
          required 
          className="min-h-[100px]" 
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="reset" variant="outline" onClick={() => {
          setName('');
          setRole('');
          setCompany('');
          setTestimonial('');
          setStars('5');
          setAvatar('/placeholder.svg');
        }}>
          Clear
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Testimonial
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Resources Form
const ResourceForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('FileText');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createResource({
        title,
        description,
        icon,
        url
      });
      
      toast.success('Resource created successfully');
      // Reset form
      setTitle('');
      setDescription('');
      setIcon('FileText');
      setUrl('');
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Resource title" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger>
              <SelectValue placeholder="Select icon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FileText">Document</SelectItem>
              <SelectItem value="BookOpen">Book</SelectItem>
              <SelectItem value="Info">Information</SelectItem>
              <SelectItem value="Map">Map</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="url">URL or Link</Label>
        <Input 
          id="url" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="Resource URL or link" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Resource description" 
          required 
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="reset" variant="outline" onClick={() => {
          setTitle('');
          setDescription('');
          setIcon('FileText');
          setUrl('');
        }}>
          Clear
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Resource
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Content Management Component
export const MarketingContent: React.FC = () => {
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
              <CardDescription>Create and edit blog posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <BlogPostForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Testimonials Tab */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Testimonial Management</CardTitle>
              <CardDescription>Add customer testimonials to showcase on the website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TestimonialForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Resource Management</CardTitle>
              <CardDescription>Add helpful resources for users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResourceForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
