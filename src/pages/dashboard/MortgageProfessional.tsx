
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats, PropertyCheckSection, MarketingSection, RecentActivitySection, RecentContactsSection } from '@/components/dashboard/mortgage';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useMortgageDashboard } from '@/hooks/useMortgageDashboard';
import { useNavigate } from 'react-router-dom';

const MortgageProfessionalDashboard: React.FC = () => {
  const {
    signOut,
    firstName
  } = useMortgageDashboard();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const welcomeMessage = firstName ? `Welcome, ${firstName}` : 'Mortgage Professional Dashboard';
  
  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <DashboardHeader title={welcomeMessage} />

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lmi-search">Bulk Search</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          <DashboardStats />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PropertyCheckSection />
            <MarketingSection />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentActivitySection />
            <RecentContactsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageProfessionalDashboard;
