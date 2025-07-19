
import React from 'react';
import Header from '@/components/Header';

const ProductPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Product</h1>
          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground mb-8">
              Discover our comprehensive LMI property checking solution designed for real estate professionals and homebuyers.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">Property Eligibility Check</h2>
                <p className="text-muted-foreground mb-4">
                  Instantly verify if properties qualify for LMI assistance programs and government incentives.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Real-time eligibility verification</li>
                  <li>Multiple program database</li>
                  <li>Detailed eligibility reports</li>
                </ul>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">Professional Tools</h2>
                <p className="text-muted-foreground mb-4">
                  Advanced tools for realtors and mortgage professionals to serve their clients better.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Client management system</li>
                  <li>Bulk address processing</li>
                  <li>Marketing campaign tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
