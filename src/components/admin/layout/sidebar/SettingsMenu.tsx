
import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import {
  Settings,
  HelpCircle
} from "lucide-react";

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
