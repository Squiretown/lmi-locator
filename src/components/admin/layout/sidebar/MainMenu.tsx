import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, ShieldCheck, Building, Kanban, Search, Briefcase, History, UserCheck } from 'lucide-react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAdminPermissions } from '../AdminPermissionsContext';
export function AdminSidebarMainMenu() {
  const {
    hasPermission,
    unreadNotifications
  } = useAdminPermissions();
  return <SidebarGroup>
      
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard">
              <NavLink to="/admin" end className={({
              isActive
            }) => isActive ? 'data-[active=true]' : ''}>
                <LayoutDashboard className="py-0" />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Users">
              <NavLink to="/admin/users" className={({
              isActive
            }) => isActive ? 'data-[active=true]' : ''}>
                <Users />
                <span>Users</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Mortgage Brokers">
              <NavLink to="/admin/mortgage-brokers" className={({
              isActive
            }) => isActive ? 'data-[active=true]' : ''}>
                <Briefcase />
                <span>Mortgage Brokers</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Realtors">
              <NavLink to="/admin/realtors" className={({
              isActive
            }) => isActive ? 'data-[active=true]' : ''}>
                <UserCheck />
                <span>Realtors</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Marketing">
              <NavLink to="/admin/marketing" className={({
              isActive
            }) => isActive ? 'data-[active=true]' : ''}>
                <Kanban />
                <span>Marketing</span>
                
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Search History">
              <NavLink to="/admin/search-history" className={({
              isActive
            }) => isActive ? 'data-[active=true]' : ''}>
                <History />
                <span>Search History</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>;
}