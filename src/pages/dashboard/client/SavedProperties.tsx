import React from 'react';

const SavedProperties: React.FC = () => {
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
      
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">
          Saved properties will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default SavedProperties;