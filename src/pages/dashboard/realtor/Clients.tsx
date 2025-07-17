import React from 'react';
import { ClientList } from '@/components/dashboard/realtor/ClientList';

const RealtorClients: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Client Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your real estate clients and send invitations
        </p>
      </div>
      
      <ClientList />
    </div>
  );
};

export default RealtorClients;