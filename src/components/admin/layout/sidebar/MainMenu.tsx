
import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Settings, 
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const MenuLink: React.FC<{
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
}> = ({ to, icon: Icon, children, isActive }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors",
      isActive 
        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{children}</span>
  </Link>
);

export const AdminSidebarMainMenu: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="space-y-1">
      <h3 className="px-3 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-2">
        Overview
      </h3>
      
      <MenuLink 
        to="/admin" 
        icon={BarChart3}
        isActive={location.pathname === '/admin'}
      >
        Dashboard
      </MenuLink>
      
      <MenuLink 
        to="/admin/marketing" 
        icon={TrendingUp}
        isActive={location.pathname === '/admin/marketing'}
      >
        Marketing
      </MenuLink>
      
      <MenuLink 
        to="/admin/users" 
        icon={Users}
        isActive={location.pathname === '/admin/users'}
      >
        Users
      </MenuLink>

      <MenuLink 
        to="/admin/help" 
        icon={HelpCircle}
        isActive={location.pathname === '/admin/help'}
      >
        Help Management
      </MenuLink>
    </div>
  );
};
