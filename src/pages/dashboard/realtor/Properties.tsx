import React from 'react';
import { PropertyActivityChart } from '@/components/dashboard/realtor/PropertyActivityChart';

const RealtorProperties: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Property Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your property listings
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropertyActivityChart />
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Listings</h3>
          <p className="text-muted-foreground">
            Property listings management coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealtorProperties;