
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ClientHeader } from '@/components/dashboard/client/ClientHeader';
import { ClientDashboardContent } from '@/components/dashboard/client/ClientDashboardContent';
import { User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ClientDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="relative">
      {/* User menu dropdown */}
      <div className="absolute top-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm hover:bg-gray-50">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="container mx-auto px-4 py-6">
        <ClientHeader title="Your Home Buying Dashboard" onSignOut={signOut} />
        
        <div className="mt-6">
          <ClientDashboardContent />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
