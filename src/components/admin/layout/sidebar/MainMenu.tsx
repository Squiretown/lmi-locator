
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Kanban, Search, Briefcase, History, UserCheck } from 'lucide-react';
import { useAdminPermissions } from '../AdminPermissionsContext';

export function AdminSidebarMainMenu() {
  const { hasPermission } = useAdminPermissions();

  return (
    <div className="space-y-1">
      <NavLink 
        to="/admin" 
        end 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </NavLink>
      
      <NavLink 
        to="/admin/users" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <Users size={16} />
        <span>Users</span>
      </NavLink>
      
      <NavLink 
        to="/admin/mortgage-brokers" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <Briefcase size={16} />
        <span>Mortgage Brokers</span>
      </NavLink>
      
      <NavLink 
        to="/admin/realtors" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <UserCheck size={16} />
        <span>Realtors</span>
      </NavLink>
      
      <NavLink 
        to="/admin/marketing" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <Kanban size={16} />
        <span>Marketing</span>
      </NavLink>
      
      <NavLink 
        to="/admin/search-history" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <History size={16} />
        <span>Search History</span>
      </NavLink>
    </div>
  );
}
