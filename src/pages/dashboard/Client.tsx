
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ClientDashboardContent } from '@/components/dashboard/client/ClientDashboardContent';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Get user's first name from metadata or use "there" as fallback
  const firstName = user?.user_metadata?.first_name || "there";
  const welcomeMessage = `Welcome, ${firstName}!`;
  
  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader title={welcomeMessage} />
        
        <div className="mt-6">
          <ClientDashboardContent />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
