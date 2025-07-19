
import React from 'react';
import Header from '@/components/Header';

const ResourcesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Resources</h1>
          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Educational resources and guides for understanding LMI eligibility and homebuying assistance programs.
            </p>
            
            <div className="grid gap-6">
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">LMI Eligibility Guide</h2>
                <p className="text-muted-foreground">
                  Complete guide to understanding LMI thresholds and qualification requirements.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">First-Time Buyer Programs</h2>
                <p className="text-muted-foreground">
                  Overview of available assistance programs for first-time homebuyers.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">Professional Training</h2>
                <p className="text-muted-foreground">
                  Training materials for real estate and mortgage professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
