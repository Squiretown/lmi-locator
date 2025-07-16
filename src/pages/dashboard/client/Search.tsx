import React from 'react';

const ClientSearch: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Property Search
        </h1>
        <p className="text-muted-foreground mt-1">
          Search for properties and check LMI eligibility
        </p>
      </div>
      
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">
          Property search functionality will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default ClientSearch;