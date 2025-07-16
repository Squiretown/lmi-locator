import React from 'react';
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  Settings,
  FolderSearch,
  Target
} from "lucide-react";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DashboardSidebar: React.FC = () => {
  const { userType } = useAuth();
  const location = useLocation();

  const getNavigationItems = (): NavigationItem[] => {
    switch (userType) {
      case 'client':
        return [
          { title: "Dashboard", url: "/dashboard/client", icon: Home },
          { title: "Property Search", url: "/dashboard/client/search", icon: Search },
          { title: "Saved Properties", url: "/dashboard/client/saved", icon: Heart },
          { title: "Bulk Search", url: "/dashboard/bulk-search", icon: FileSearch },
          { title: "Settings", url: "/settings", icon: Settings },
        ];
      
      case 'realtor':
        return [
          { title: "Dashboard", url: "/dashboard/realtor", icon: Home },
          { title: "Clients", url: "/dashboard/realtor/clients", icon: Users },
          { title: "Properties", url: "/dashboard/realtor/properties", icon: Building },
          { title: "Marketing", url: "/dashboard/realtor/marketing", icon: Megaphone },
          { title: "Analytics", url: "/dashboard/realtor/analytics", icon: BarChart3 },
          { title: "Bulk Search", url: "/dashboard/bulk-search", icon: FileSearch },
          { title: "Settings", url: "/settings", icon: Settings },
        ];
      
      case 'mortgage_professional':
      case 'mortgage':
        return [
          { title: "Dashboard", url: "/dashboard/mortgage", icon: Home },
          { title: "Clients", url: "/dashboard/mortgage/clients", icon: Users },
          { title: "Bulk Search", url: "/dashboard/bulk-search", icon: FileSearch },
          { title: "Marketing Campaigns", url: "/dashboard/lmi-marketing", icon: Target },
          { title: "Search Analytics", url: "/dashboard/mortgage/analytics", icon: BarChart3 },
          { title: "Settings", url: "/settings", icon: Settings },
        ];
      
      default:
        return [
          { title: "Dashboard", url: "/dashboard/client", icon: Home },
          { title: "Settings", url: "/settings", icon: Settings },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (url: string) => {
    if (url === location.pathname) return true;
    // For dashboard root routes, only match exact path
    if (url.endsWith('/client') || url.endsWith('/realtor') || url.endsWith('/mortgage')) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground border-r flex flex-col h-full">
      <div className="p-4 pt-8">
        <h2 className="text-lg font-semibold text-sidebar-primary">
          {userType === 'client' && 'Client Portal'}
          {userType === 'realtor' && 'Realtor Portal'}
          {(userType === 'mortgage_professional' || userType === 'mortgage') && 'Mortgage Portal'}
          {!userType && 'Dashboard'}
        </h2>
      </div>
      
      <div className="flex-1 px-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActiveRoute(item.url)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground"
            )}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default DashboardSidebar;