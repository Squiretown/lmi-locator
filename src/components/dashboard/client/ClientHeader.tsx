
import React from 'react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/hooks/useAuth';

interface ClientHeaderProps {
  title?: string;
  onSignOut: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  title,
  onSignOut
}) => {
  const { user } = useAuth();
  
  // Get user's first name from metadata or use "there" as fallback
  const firstName = user?.user_metadata?.first_name || "there";
  
  // Create personalized welcome message
  const welcomeMessage = `Welcome, ${firstName}!`;
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
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
