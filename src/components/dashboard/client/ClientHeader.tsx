
import React from 'react';
import { Button } from '@/components/ui/button';

interface ClientHeaderProps {
  title: string;
  onSignOut: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({ title, onSignOut }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
    </div>
  );
};
