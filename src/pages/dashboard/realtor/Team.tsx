
import React from 'react';
import { TeamManagement } from '@/components/teams/TeamManagement';

const RealtorTeam: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Team Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Build and manage your professional network
        </p>
      </div>
      
      <TeamManagement />
    </div>
  );
};

export default RealtorTeam;
