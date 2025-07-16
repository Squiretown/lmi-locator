import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ClientDashboardContent } from '@/components/dashboard/client/ClientDashboardContent';

const ClientOverview: React.FC = () => {
  const { user } = useAuth();
  
  // Get user's first name from metadata or use "there" as fallback
  const firstName = user?.user_metadata?.first_name || "there";
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your property search overview
        </p>
      </div>
      
      <ClientDashboardContent />
    </div>
  );
};

export default ClientOverview;