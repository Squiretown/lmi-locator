
import React from 'react';
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
    </div>
  );
};
