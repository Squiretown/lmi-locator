
import React from 'react';
import Header from '@/components/Header';

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Blog</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Latest insights on LMI eligibility, homebuying assistance, and real estate trends
          </p>
          
          <div className="grid gap-8">
            <article className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-3">Understanding LMI Thresholds in 2024</h2>
              <p className="text-muted-foreground mb-4">
                A comprehensive guide to the latest LMI threshold updates and what they mean for homebuyers.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">March 15, 2024</span>
                <button className="text-primary hover:underline">Read More</button>
              </div>
            </article>
            
            <article className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-3">First-Time Buyer Programs: What's Available</h2>
              <p className="text-muted-foreground mb-4">
                Explore the various assistance programs available to first-time homebuyers across different states.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">March 10, 2024</span>
                <button className="text-primary hover:underline">Read More</button>
              </div>
            </article>
            
            <article className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-3">Real Estate Technology Trends</h2>
              <p className="text-muted-foreground mb-4">
                How technology is transforming the real estate industry and improving client experiences.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">March 5, 2024</span>
                <button className="text-primary hover:underline">Read More</button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
