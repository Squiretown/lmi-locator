
import React from 'react';
import { Helmet } from 'react-helmet';
import PageHeader from '@/components/PageHeader';
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
        <PageHeader 
          title="LMI Property Checker"
          description="Check if a property is in a Low-to-Moderate Income (LMI) census tract and eligible for special programs and incentives."
          actionLink={{
            text: "Admin Dashboard",
            href: "/admin"
          }}
        />
        
        <PropertyChecker />
      </div>
    </>
  );
};

export default Index;
