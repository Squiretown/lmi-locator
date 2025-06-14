
import React from 'react';
import { Outlet } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { AdminPermissionsProvider } from './AdminPermissionsContext';

const AdminLayout: React.FC = () => {
  return (
    <AdminPermissionsProvider>
      <div className="min-h-screen w-full">
        <AdminHeader />
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
          <AdminSidebar />
          
          <main className="flex-1 overflow-auto bg-background">
            <ScrollArea className="h-full w-full">
              {/* Outlet renders child routes */}
              <Outlet />
            </ScrollArea>
          </main>
        </div>
      </div>
    </AdminPermissionsProvider>
  );
};

export default AdminLayout;
