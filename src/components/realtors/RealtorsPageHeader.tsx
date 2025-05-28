
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail } from 'lucide-react';

interface RealtorsPageHeaderProps {
  onInviteClick: () => void;
  onAddClick: () => void;
}

export const RealtorsPageHeader: React.FC<RealtorsPageHeaderProps> = ({
  onInviteClick,
  onAddClick,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h2 className="text-2xl font-bold">Realtors</h2>
        <p className="text-muted-foreground">Manage real estate agents in the system</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onInviteClick} variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Invite Realtor
        </Button>
        <Button onClick={onAddClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Realtor
        </Button>
      </div>
    </div>
  );
};
