
import React from 'react';
import { NavLink } from 'react-router-dom';
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
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Settings">
          <NavLink 
            to="/admin/settings"
            className={({ isActive }) => 
              isActive ? 'data-[active=true]' : ''
            }
          >
            <Settings className="mr-2" />
            <span>Settings</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Help">
          <NavLink 
            to="/admin/help"
            className={({ isActive }) => 
              isActive ? 'data-[active=true]' : ''
            }
          >
            <HelpCircle className="mr-2" />
            <span>Help</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
