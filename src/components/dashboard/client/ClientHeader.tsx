
import React from 'react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface ClientHeaderProps {
  title: string;
  onSignOut: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  title,
  onSignOut
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
      </div>
    </div>
  );
};
