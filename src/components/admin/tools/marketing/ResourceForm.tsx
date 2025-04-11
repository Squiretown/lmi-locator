
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { createResource } from "@/lib/supabase/marketing";

export const ResourceForm: React.FC = () => {
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
