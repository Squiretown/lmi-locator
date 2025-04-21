import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleUserRound, Contact, HelpCircle, LogOut, Settings, Home, UserPlus } from 'lucide-react';
import { DashboardStats, PropertyCheckSection, MarketingSection, RecentActivitySection, RecentContactsSection } from '@/components/dashboard/mortgage';
import { useMortgageDashboard } from '@/hooks/useMortgageDashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

const MortgageProfessionalDashboard: React.FC = () => {
  const {
    signOut
  } = useMortgageDashboard();

  return <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Mortgage Professional Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Contact Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Contact className="w-4 h-4" />
                Contact
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Contact className="w-4 h-4 mr-2" />
                Contact List
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CircleUserRound className="w-4 h-4" />
                My Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
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
            <TabsTrigger value="lmi-search">Bulk Search</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-4 ml-4">
          <Button variant="ghost" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button variant="ghost" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            Help
          </Button>
        </div>
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
    </div>;
};

export default MortgageProfessionalDashboard;
