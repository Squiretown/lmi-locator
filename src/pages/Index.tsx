
import React from 'react';
import { Helmet } from 'react-helmet';
import PropertyChecker from '@/components/PropertyChecker';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>LMICHECK.COM - LMI Property Checker</title>
        <meta 
          name="description" 
          content="Check if a property is in a Low-to-Moderate Income (LMI) census tract. Find eligible programs and incentives easily." 
        />
        <meta 
          property="og:title" 
          content="LMICHECK.COM - LMI Property Checker" 
        />
        <meta 
          property="og:description" 
          content="Discover if your property is in a Low-to-Moderate Income (LMI) census tract and unlock special programs." 
        />
        <meta 
          property="og:image" 
          content="/og-image.png" 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center mt-16 mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Determine If Your Property Is In An LMI Eligible Census Tract
          </h1>
          <p className="text-xl text-muted-foreground">
            Check if a property is in a Low-to-Moderate Income (LMI) census tract and eligible for special programs and incentives.
          </p>
        </div>
        
        <PropertyChecker />
      </div>
    </>
  );
};

export default Index;
