
import React from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useAdminPermissions } from './AdminPermissionsContext';
import { AdminSidebarMainMenu, AdminSidebarSystemMenu, AdminSidebarSettingsMenu } from './AdminSidebarMenus';
import AdminStatusFooter from './AdminStatusFooter';

const AdminSidebar: React.FC = () => {
  const { userType } = useAdminPermissions();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground border-r flex flex-col h-full">
      <div className="p-4 pt-8">
        {userType && (
          <div className="mt-1">
            <Badge variant="outline" className="capitalize">
              {userType.replace('_', ' ')}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="flex-1 px-4 space-y-6">
        <AdminSidebarMainMenu />
        <AdminSidebarSystemMenu />
        <div className="border-t border-sidebar-border my-4"></div>
        <AdminSidebarSettingsMenu />
      </div>
      
      <div className="p-4">
        <AdminStatusFooter onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default AdminSidebar;
