
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { createTestimonial } from "@/lib/supabase/marketing";

export const TestimonialForm: React.FC = () => {
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
