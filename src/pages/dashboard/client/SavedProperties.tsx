
import React from 'react';
import { ClientSavedProperties } from '@/components/dashboard/client/ClientSavedProperties';

const SavedProperties: React.FC = () => {
  const handleAddressSelect = (address: string) => {
    // Navigate back to main client dashboard
    window.location.href = '/dashboard/client';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Saved Properties
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage your saved properties
        </p>
      </div>
      
      <ClientSavedProperties onAddressSelect={handleAddressSelect} />
    </div>
  );
};

export default SavedProperties;
