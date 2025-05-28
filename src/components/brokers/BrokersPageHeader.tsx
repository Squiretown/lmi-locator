
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail } from 'lucide-react';

interface BrokersPageHeaderProps {
  onInviteClick: () => void;
  onAddClick: () => void;
}

export const BrokersPageHeader: React.FC<BrokersPageHeaderProps> = ({
  onInviteClick,
  onAddClick,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h2 className="text-2xl font-bold">Mortgage Brokers</h2>
        <p className="text-muted-foreground">Manage mortgage brokers in the system</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onInviteClick} variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Invite Broker
        </Button>
        <Button onClick={onAddClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Broker
        </Button>
      </div>
    </div>
  );
};
