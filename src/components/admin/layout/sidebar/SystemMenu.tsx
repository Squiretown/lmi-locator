
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Database, Key, FileText, AlertTriangle } from "lucide-react";
import { useAdminPermissions } from '../AdminPermissionsContext';

export const AdminSidebarSystemMenu: React.FC = () => {
  const { hasPermission } = useAdminPermissions();

  if (!hasPermission('system_admin')) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
        System
      </div>
      
      <NavLink 
        to="/admin/permissions" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <Shield size={16} />
        <span>Permissions</span>
      </NavLink>
      
      <NavLink 
        to="/admin/database" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <Database size={16} />
        <span>Database</span>
      </NavLink>
      
      <NavLink 
        to="/admin/api-keys" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <Key size={16} />
        <span>API Keys</span>
      </NavLink>
      
      <NavLink 
        to="/admin/logs" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <FileText size={16} />
        <span>System Logs</span>
      </NavLink>
      
      <NavLink 
        to="/admin/error-logs" 
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <AlertTriangle size={16} />
        <span>Error Logs</span>
      </NavLink>
    </div>
  );
};
