
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { createBlogPost } from "@/lib/supabase/marketing";

export const BlogPostForm: React.FC = () => {
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
