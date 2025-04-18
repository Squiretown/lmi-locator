
import React from 'react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface DashboardHeaderProps {
  onSignOut: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSignOut }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Mortgage Professional Dashboard</h1>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
      </div>
    </div>
  );
};
