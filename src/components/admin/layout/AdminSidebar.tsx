
import React from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useAdminPermissions } from './AdminPermissionsContext';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarSeparator 
} from "@/components/ui/sidebar";
import {
  AdminSidebarMainMenu,
  AdminSidebarSystemMenu,
  AdminSidebarSettingsMenu
} from './AdminSidebarMenus';
import AdminStatusFooter from './AdminStatusFooter';

const AdminSidebar: React.FC = () => {
  const { userType } = useAdminPermissions();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        {userType && (
          <div className="px-4 mt-1">
            <Badge variant="outline" className="capitalize">
              {userType.replace('_', ' ')}
            </Badge>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <div className="mt-16">
          <AdminSidebarMainMenu />
          <AdminSidebarSystemMenu />
          <SidebarSeparator />
          <AdminSidebarSettingsMenu />
        </div>
      </SidebarContent>
      
      <SidebarFooter>
        <AdminStatusFooter onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
