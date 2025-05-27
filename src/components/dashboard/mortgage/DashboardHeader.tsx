
import React from 'react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import ProfileMenu from '@/components/auth/ProfileMenu';

interface DashboardHeaderProps {
  onSignOut: () => void;
  firstName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSignOut, firstName }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">
        {firstName ? `Welcome, ${firstName}` : 'Mortgage Professional Dashboard'}
      </h1>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <ProfileMenu />
      </div>
    </div>
  );
};
