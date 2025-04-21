
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
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
          <span className="sr-only">Menu</span>
          <img
            src="/lovable-uploads/6b3583d8-18f9-4772-a84d-53d6bd864538.png"
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
          />
        </Button>
      </div>
    </div>
  );
};
