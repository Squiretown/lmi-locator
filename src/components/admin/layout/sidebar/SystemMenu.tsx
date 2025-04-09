
import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminPermissions } from '../AdminPermissionsContext';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarSeparator
} from "@/components/ui/sidebar";
import {
  UserPlus,
  Shield,
  ListChecks
} from "lucide-react";

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
