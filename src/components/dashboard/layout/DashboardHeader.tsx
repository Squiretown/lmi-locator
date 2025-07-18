
import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import { ProfileMenu } from "@/components/auth/ProfileMenu";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  Heart, 
  FileSearch, 
  Users, 
  Building, 
  Megaphone, 
  BarChart3,
  Target
} from "lucide-react";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DashboardHeader: React.FC = () => {
  const { userType } = useAuth();
  const location = useLocation();

  const getNavigationItems = (): NavigationItem[] => {
    switch (userType) {
      case 'client':
        return [
          { title: "Dashboard", url: "/dashboard/client", icon: Home },
        ];
      
      case 'realtor':
        return [
          { title: "Dashboard", url: "/dashboard/realtor", icon: Home },
          { title: "Clients", url: "/dashboard/realtor/clients", icon: Users },
          { title: "Properties", url: "/dashboard/realtor/properties", icon: Building },
          { title: "Marketing", url: "/dashboard/realtor/marketing", icon: Megaphone },
          { title: "Analytics", url: "/dashboard/realtor/analytics", icon: BarChart3 },
        ];
      
      case 'mortgage_professional':
      case 'mortgage':
        return [
          { title: "Dashboard", url: "/dashboard/mortgage", icon: Home },
          { title: "Clients", url: "/dashboard/mortgage/clients", icon: Users },
          { title: "Marketing", url: "/dashboard/lmi-marketing", icon: Target },
          { title: "Analytics", url: "/dashboard/mortgage/analytics", icon: BarChart3 },
        ];
      
      default:
        return [
          { title: "Dashboard", url: "/dashboard/client", icon: Home },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (url: string) => {
    if (url === location.pathname) return true;
    if (url.endsWith('/client') || url.endsWith('/realtor') || url.endsWith('/mortgage')) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  const getPortalTitle = () => {
    switch (userType) {
      case 'client': return 'Client Portal';
      case 'realtor': return 'Realtor Portal';
      case 'mortgage_professional':
      case 'mortgage': return 'Mortgage Portal';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <NavLink className="mr-6 flex items-center space-x-2" to={navigationItems[0]?.url || '/dashboard/client'}>
            <span className="hidden font-bold sm:inline-block">
              {getPortalTitle()}
            </span>
          </NavLink>
          {navigationItems.length > 1 && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className={cn(
                    "transition-colors hover:text-foreground/80 flex items-center space-x-2",
                    isActiveRoute(item.url) ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          )}
        </div>
        
        {/* Mobile navigation */}
        <div className="flex flex-1 items-center space-x-2 md:hidden">
          <span className="font-bold">
            {getPortalTitle()}
          </span>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Mobile menu could go here if needed */}
          </div>
          <nav className="flex items-center space-x-2">
            <NotificationCenter />
            <ProfileMenu />
          </nav>
        </div>
      </div>
      
      {/* Mobile navigation menu - only show if there are multiple nav items */}
      {navigationItems.length > 1 && (
        <div className="border-t md:hidden">
          <nav className="container flex items-center space-x-4 py-2 overflow-x-auto">
            {navigationItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className={cn(
                  "flex flex-col items-center space-y-1 px-3 py-2 text-xs font-medium transition-colors hover:text-foreground/80 whitespace-nowrap",
                  isActiveRoute(item.url) ? "text-foreground" : "text-foreground/60"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
