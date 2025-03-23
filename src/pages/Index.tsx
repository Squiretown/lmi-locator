
import React from 'react';
import PageHeader from '@/components/PageHeader';
import PropertyChecker from '@/components/PropertyChecker';
import ConnectionTester from '@/components/development/ConnectionTester';

const Index = () => {
  // Only show connection tester in development environment
  const showConnectionTester = import.meta.env.DEV;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="LMI Property Checker"
        description="Check if a property is in a Low-to-Moderate Income (LMI) census tract and eligible for special programs and incentives."
        actionLink={{
          text: "Admin Dashboard",
          href: "/admin"
        }}
      />
      
      {showConnectionTester && (
        <div className="mb-8">
          <ConnectionTester />
        </div>
      )}
      
      <PropertyChecker />
    </div>
  );
};

export default Index;
