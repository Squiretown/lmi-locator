
import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  MessageSquare,
  CreditCard,
  Settings,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminPermissions } from '../AdminPermissionsContext';
import { useNewInquiriesCount } from '@/hooks/useNewInquiriesCount';

const MenuLink: React.FC<{
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
  badge?: number;
}> = ({ to, icon: Icon, children, isActive, badge }) => (
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
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
);

export const AdminSidebarMainMenu: React.FC = () => {
  const location = useLocation();
  const { hasPermission } = useAdminPermissions();
  const { count: newInquiriesCount } = useNewInquiriesCount();
  
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
      
      {hasPermission('manage_marketing_campaigns') && (
        <MenuLink 
          to="/admin/marketing" 
          icon={TrendingUp}
          isActive={location.pathname === '/admin/marketing'}
        >
          Marketing
        </MenuLink>
      )}
      
      {hasPermission('view_user_management') && (
        <MenuLink 
          to="/admin/users" 
          icon={Users}
          isActive={location.pathname === '/admin/users'}
        >
          Users
        </MenuLink>
      )}
      
      {hasPermission('view_notifications') && (
        <MenuLink 
          to="/admin/contact-inquiries" 
          icon={Mail}
          isActive={location.pathname === '/admin/contact-inquiries'}
          badge={newInquiriesCount}
        >
          Contact Inquiries
        </MenuLink>
      )}
      
      {hasPermission('view_notifications') && (
        <MenuLink 
          to="/admin/messaging" 
          icon={MessageSquare}
          isActive={location.pathname === '/admin/messaging'}
        >
          Messaging
        </MenuLink>
      )}
      
      {hasPermission('manage_system_settings') && (
        <MenuLink 
          to="/admin/subscriptions" 
          icon={CreditCard}
          isActive={location.pathname === '/admin/subscriptions'}
        >
          Subscriptions
        </MenuLink>
      )}
    </div>
  );
};
