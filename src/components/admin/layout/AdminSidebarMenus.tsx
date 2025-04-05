
import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminPermissions } from './AdminPermissionsContext';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarSeparator 
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart4, 
  Building, 
  Users, 
  Bell, 
  UserCog, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  Shield, 
  ListChecks,
  UserPlus,
  Mail
} from "lucide-react";

export const AdminSidebarMainMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, unreadNotifications } = useAdminPermissions();
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          isActive={location.pathname === '/admin'} 
          tooltip="Dashboard"
          onClick={() => navigate('/admin')}
        >
          <BarChart4 className="mr-2" />
          <span>Dashboard</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {hasPermission('run_marketing') && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={location.pathname === '/admin/marketing'} 
            tooltip="Marketing"
            onClick={() => navigate('/admin/marketing')}
          >
            <Mail className="mr-2" />
            <span>Marketing</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      
      {hasPermission('manage_system') && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={location.pathname === '/admin/properties'} 
            tooltip="Properties"
            onClick={() => navigate('/admin/properties')}
          >
            <Building className="mr-2" />
            <span>Properties</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      
      {hasPermission('manage_clients') && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={location.pathname === '/admin/users'} 
            tooltip="Users"
            onClick={() => navigate('/admin/users')}
          >
            <Users className="mr-2" />
            <span>Users</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      
      {hasPermission('manage_system') && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={location.pathname === '/admin/alerts'} 
            tooltip="Alert System"
            onClick={() => navigate('/admin/alerts')}
          >
            <Bell className="mr-2" />
            <span>Alert System</span>
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadNotifications}
              </Badge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      
      {hasPermission('manage_clients') && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={location.pathname === '/admin/realtors'} 
            tooltip="Realtor Database"
            onClick={() => navigate('/admin/realtors')}
          >
            <UserCog className="mr-2" />
            <span>Realtor Database</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      
      <SidebarMenuItem>
        <SidebarMenuButton 
          isActive={location.pathname === '/admin/reports'} 
          tooltip="Reports"
          onClick={() => navigate('/admin/reports')}
        >
          <BarChart2 className="mr-2" />
          <span>Reports</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export const AdminSidebarSystemMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAdminPermissions();
  
  if (!hasPermission('manage_system')) {
    return null;
  }
  
  return (
    <>
      <SidebarSeparator />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={location.pathname === '/admin/user-management'} 
            tooltip="User Management"
            onClick={() => navigate('/admin/user-management')}
          >
            <UserPlus className="mr-2" />
            <span>User Management</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={location.pathname === '/admin/permissions'} 
            tooltip="Permissions"
            onClick={() => navigate('/admin/permissions')}
          >
            <Shield className="mr-2" />
            <span>Permissions</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={location.pathname === '/admin/verification'} 
            tooltip="Verification"
            onClick={() => navigate('/admin/verification')}
          >
            <ListChecks className="mr-2" />
            <span>Verification</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
};

export const AdminSidebarSettingsMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          isActive={location.pathname === '/admin/settings'} 
          tooltip="Settings"
          onClick={() => navigate('/admin/settings')}
        >
          <Settings className="mr-2" />
          <span>Settings</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton 
          isActive={location.pathname === '/admin/help'} 
          tooltip="Help"
          onClick={() => navigate('/admin/help')}
        >
          <HelpCircle className="mr-2" />
          <span>Help</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
