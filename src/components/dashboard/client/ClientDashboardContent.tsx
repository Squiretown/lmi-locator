
import React, { useState } from 'react';
import { ClientTabs } from './ClientTabs';
import PropertyChecker from '@/components/PropertyChecker';

export const ClientDashboardContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <PropertyChecker />
      <ClientTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
