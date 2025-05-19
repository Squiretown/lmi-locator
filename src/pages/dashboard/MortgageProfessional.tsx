import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, HelpCircle } from 'lucide-react';
import { DashboardStats, PropertyCheckSection, MarketingSection, RecentActivitySection, RecentContactsSection, DashboardHeader } from '@/components/dashboard/mortgage';
import { useMortgageDashboard } from '@/hooks/useMortgageDashboard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from 'react-router-dom';
const MortgageProfessionalDashboard: React.FC = () => {
  const {
    signOut,
    firstName
  } = useMortgageDashboard();
  const navigate = useNavigate();
  return <div className="relative">
      {/* Header with main content and user menu */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <DashboardHeader onSignOut={signOut} firstName={firstName} />

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
    </div>;
};
export default MortgageProfessionalDashboard;