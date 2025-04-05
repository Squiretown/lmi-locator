
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminSidebar from './AdminSidebar';
import { AdminPermissionsProvider } from './AdminPermissionsContext';

const AdminLayout: React.FC = () => {
  return (
    <AdminPermissionsProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar />
          
          <main className="flex-1 overflow-auto bg-background">
            <ScrollArea className="h-full w-full">
              <Outlet />
            </ScrollArea>
          </main>
        </div>
      </SidebarProvider>
    </AdminPermissionsProvider>
  );
};

export default AdminLayout;
