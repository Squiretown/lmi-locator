
import React from 'react';
import { TeamManagement } from '@/components/teams/TeamManagement';

const RealtorTeam: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your real estate team and collaborations
        </p>
      </div>

      <TeamManagement />
    </div>
  );
};

export default RealtorTeam;
