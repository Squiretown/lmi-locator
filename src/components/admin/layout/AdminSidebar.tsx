
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
import ProfileMenu from '@/components/auth/ProfileMenu';

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
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg">LMI Check Admin</div>
          </div>
          <ProfileMenu />
        </div>
        {userType && (
          <div className="px-4 mt-1">
            <Badge variant="outline" className="capitalize">
              {userType.replace('_', ' ')}
            </Badge>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <AdminSidebarMainMenu />
        <AdminSidebarSystemMenu />
        <SidebarSeparator />
        <AdminSidebarSettingsMenu />
      </SidebarContent>
      
      <SidebarFooter>
        <AdminStatusFooter onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
