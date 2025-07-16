import React from 'react';
import { Outlet } from "react-router-dom";
import DashboardHeader from './DashboardHeader';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <DashboardHeader />
      
      <main className="flex-1 bg-background">
        {/* Outlet renders child routes */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;