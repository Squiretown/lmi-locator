
import React, { useState } from 'react';
import { ClientTabs } from './ClientTabs';

export const ClientDashboardContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <ClientTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
