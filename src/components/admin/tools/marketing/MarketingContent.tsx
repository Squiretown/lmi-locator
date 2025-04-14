
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, MessageSquare, BookOpen, CheckSquare } from "lucide-react";
import { BlogPostForm } from './BlogPostForm';
import { TestimonialForm } from './TestimonialForm';
import { ResourceForm } from './ResourceForm';
import { EligibilityQuestionsForm } from './EligibilityQuestionsForm';

export const MarketingContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="blog">
        <TabsList className="grid grid-cols-4 mb-4">
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
          <TabsTrigger value="eligibility" className="flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            Eligibility
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
        
        {/* Eligibility Questions Tab */}
        <TabsContent value="eligibility">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Eligibility Questions</CardTitle>
              <CardDescription>Manage the Down Payment Assistance Eligibility questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EligibilityQuestionsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
