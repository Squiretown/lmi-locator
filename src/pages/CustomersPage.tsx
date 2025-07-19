
import React from 'react';
import Header from '@/components/Header';

const CustomersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Our Customers</h1>
          <p className="text-lg text-muted-foreground mb-12 text-center">
            Trusted by real estate professionals and homebuyers across the country
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Real Estate Professionals</h3>
              <p className="text-muted-foreground mb-4">
                Realtors use our platform to help clients find LMI-eligible properties and access homebuying assistance programs.
              </p>
              <blockquote className="italic border-l-4 border-primary pl-4">
                "This tool has transformed how we serve first-time homebuyers. The instant eligibility checks save us hours of research."
              </blockquote>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Mortgage Professionals</h3>
              <p className="text-muted-foreground mb-4">
                Mortgage brokers and lenders streamline their qualification process with comprehensive eligibility data.
              </p>
              <blockquote className="italic border-l-4 border-primary pl-4">
                "The detailed reports help us guide clients to the right programs and close deals faster."
              </blockquote>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Success Stories</h2>
            <div className="bg-card p-8 rounded-lg border">
              <p className="text-lg mb-4">
                "Since implementing LMICheck.com, we've helped over 200 families access homebuying assistance programs, 
                resulting in an average savings of $15,000 per transaction."
              </p>
              <p className="font-semibold">- Premier Realty Group</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
