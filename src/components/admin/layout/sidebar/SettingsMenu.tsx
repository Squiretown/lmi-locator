
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, HelpCircle } from "lucide-react";

export const AdminSidebarSettingsMenu: React.FC = () => {
  return (
    <div className="space-y-1">
      <NavLink 
        to="/admin/settings"
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <Settings size={16} />
        <span>Settings</span>
      </NavLink>
      
      <NavLink 
        to="/admin/help"
        className={({ isActive }) => 
          `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`
        }
      >
        <HelpCircle size={16} />
        <span>Help</span>
      </NavLink>
    </div>
  );
};
