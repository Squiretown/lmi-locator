import React from 'react';
import { Outlet } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-auto bg-background">
        <ScrollArea className="h-full w-full">
          {/* Outlet renders child routes */}
          <Outlet />
        </ScrollArea>
      </main>
    </div>
  );
};

export default DashboardLayout;