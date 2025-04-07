import React, { useEffect, useState } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar";
import { 
  BarChart4, 
  Building, 
  Users, 
  Bell, 
  UserCog, 
  BarChart2, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Activity, 
  Shield, 
  ListChecks,
  UserPlus,
  Mail,
  ToolIcon
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserPermissions, getUserTypeName } from "@/lib/supabase/user";
import AdminStatusFooter from './layout/AdminStatusFooter';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Get unread notification count using the RPC function
      const { data: notificationCount } = await supabase.rpc(
        'get_notification_counts',
        { user_uuid: session.user.id }
      );
      
      setUnreadNotifications(notificationCount?.[0]?.unread_count || 0);
      
      try {
        // Get user type name using our utility function
        const userTypeName = await getUserTypeName();
        setUserType(userTypeName || 'standard');
        
        // Get user permissions using our utility function
        const userPermissions = await getUserPermissions();
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Error in user data fetch:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Helper function to check if user has a specific permission
  const hasPermission = (permissionName: string) => {
    return permissions.includes(permissionName) || userType === 'admin';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                <Building className="h-5 w-5" />
              </div>
              <div className="font-bold text-lg">LMI Check Admin</div>
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
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={location.pathname === '/admin'} 
                  tooltip="Dashboard"
                  onClick={() => navigate('/admin')}
                >
                  <BarChart4 className="mr-2" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {hasPermission('run_marketing') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location.pathname === '/admin/marketing'} 
                    tooltip="Marketing"
                    onClick={() => navigate('/admin/marketing')}
                  >
                    <Mail className="mr-2" />
                    <span>Marketing</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission('manage_system') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location.pathname === '/admin/tools'} 
                    tooltip="Admin Tools"
                    onClick={() => navigate('/admin/tools')}
                  >
                    <ToolIcon className="mr-2" />
                    <span>Admin Tools</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission('manage_system') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location.pathname === '/admin/properties'} 
                    tooltip="Properties"
                    onClick={() => navigate('/admin/properties')}
                  >
                    <Building className="mr-2" />
                    <span>Properties</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission('manage_clients') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location.pathname === '/admin/users'} 
                    tooltip="Users"
                    onClick={() => navigate('/admin/users')}
                  >
                    <Users className="mr-2" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission('manage_system') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location.pathname === '/admin/alerts'} 
                    tooltip="Alert System"
                    onClick={() => navigate('/admin/alerts')}
                  >
                    <Bell className="mr-2" />
                    <span>Alert System</span>
                    {unreadNotifications > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission('manage_clients') && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location.pathname === '/admin/realtors'} 
                    tooltip="Realtor Database"
                    onClick={() => navigate('/admin/realtors')}
                  >
                    <UserCog className="mr-2" />
                    <span>Realtor Database</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={location.pathname === '/admin/reports'} 
                  tooltip="Reports"
                  onClick={() => navigate('/admin/reports')}
                >
                  <BarChart2 className="mr-2" />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            
            {hasPermission('manage_system') && (
              <>
                <SidebarSeparator />
                
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === '/admin/user-management'} 
                      tooltip="User Management"
                      onClick={() => navigate('/admin/user-management')}
                    >
                      <UserPlus className="mr-2" />
                      <span>User Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === '/admin/permissions'} 
                      tooltip="Permissions"
                      onClick={() => navigate('/admin/permissions')}
                    >
                      <Shield className="mr-2" />
                      <span>Permissions</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={location.pathname === '/admin/verification'} 
                      tooltip="Verification"
                      onClick={() => navigate('/admin/verification')}
                    >
                      <ListChecks className="mr-2" />
                      <span>Verification</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </>
            )}
            
            <SidebarSeparator />
            
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
          </SidebarContent>
          
          <SidebarFooter>
            <AdminStatusFooter onLogout={handleLogout} />
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 overflow-auto bg-background">
          <ScrollArea className="h-full w-full">
            <Outlet />
          </ScrollArea>
        </main>
      </div>
    </SidebarProvider>;
};

export default AdminLayout;
