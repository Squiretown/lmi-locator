
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  ToggleLeft, 
  Wrench,
  ShieldCheck
} from 'lucide-react';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from '@/components/ui/sidebar';
import { useAdminPermissions } from '../AdminPermissionsContext';

export function AdminSidebarSystemMenu() {
  const { hasPermission } = useAdminPermissions();
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>System</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Admin Tools">
              <NavLink 
                to="/admin/tools" 
                className={({ isActive }) => 
                  isActive ? 'data-[active=true]' : ''
                }
              >
                <Wrench />
                <span>Admin Tools</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Permissions">
              <NavLink 
                to="/admin/permissions" 
                className={({ isActive }) => 
                  isActive ? 'data-[active=true]' : ''
                }
              >
                <ShieldCheck />
                <span>Permissions</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Security">
              <NavLink 
                to="/admin/security" 
                className={({ isActive }) => 
                  isActive ? 'data-[active=true]' : ''
                }
              >
                <ShieldAlert />
                <span>Security</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="System Settings">
              <NavLink 
                to="/admin/settings" 
                className={({ isActive }) => 
                  isActive ? 'data-[active=true]' : ''
                }
              >
                <ToggleLeft />
                <span>System Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
