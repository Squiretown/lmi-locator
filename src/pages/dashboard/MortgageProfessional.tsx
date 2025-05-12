
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, HelpCircle } from 'lucide-react'; // Removed Search icon import
import { DashboardStats, PropertyCheckSection, MarketingSection, RecentActivitySection, RecentContactsSection } from '@/components/dashboard/mortgage';
import { useMortgageDashboard } from '@/hooks/useMortgageDashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from 'react-router-dom';

const MortgageProfessionalDashboard: React.FC = () => {
  const { signOut } = useMortgageDashboard();
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Header with main content and user menu */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mortgage Professional Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/bulk-search')} variant="outline">
              Bulk Search
            </Button>
            
            {/* User menu dropdown - moved inside container */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm hover:bg-gray-50">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate('/settings')}>
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lmi-search">LMI Search</TabsTrigger>
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
