
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PropertyChecker from '@/components/PropertyChecker';
import { ClientHeader } from '@/components/dashboard/client/ClientHeader';
import { ClientTabs } from '@/components/dashboard/client/ClientTabs';
import { ClientSavedProperties } from '@/components/dashboard/client/ClientSavedProperties';

const ClientDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showPropertyChecker, setShowPropertyChecker] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleAddressSelect = (address: string) => {
    // Extract address components
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      // Handle address selection
      setShowPropertyChecker(true);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <ClientHeader title="Your Home Buying Dashboard" onSignOut={signOut} />
      
      <ClientTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <ClientSavedProperties onAddressSelect={handleAddressSelect} />
    </div>
  );
};

export default ClientDashboard;
