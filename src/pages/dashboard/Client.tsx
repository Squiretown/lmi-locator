
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ClientHeader } from '@/components/dashboard/client/ClientHeader';
import { ClientDashboardContent } from '@/components/dashboard/client/ClientDashboardContent';
import { useNavigate } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-6">
        <ClientHeader onSignOut={handleSignOut} />
        
        <div className="mt-6">
          <ClientDashboardContent />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
