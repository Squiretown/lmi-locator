
import React from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from "@/components/ui/sidebar";
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
  Activity
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                <Building className="h-5 w-5" />
              </div>
              <div className="font-bold text-lg">LMI Admin</div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={true} tooltip="Dashboard">
                  <BarChart4 className="mr-2" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Properties">
                  <Building className="mr-2" />
                  <span>Properties</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Users">
                  <Users className="mr-2" />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Alert System">
                  <Bell className="mr-2" />
                  <span>Alert System</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Realtor Database">
                  <UserCog className="mr-2" />
                  <span>Realtor Database</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Reports">
                  <BarChart2 className="mr-2" />
                  <span>Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            
            <SidebarSeparator />
            
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="mr-2" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Help">
                  <HelpCircle className="mr-2" />
                  <span>Help</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="p-2">
              <div className="rounded-md p-2 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs">System Status: Online</span>
                </div>
                <div className="flex justify-between">
                  <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>View Details</span>
                  </button>
                  <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <LogOut className="h-3 w-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
