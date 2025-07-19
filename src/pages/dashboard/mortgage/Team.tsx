
import React from 'react';
import { TeamManagement } from '@/components/teams/TeamManagement';

const MortgageTeam: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Team Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your realtor partners and professional network
        </p>
      </div>
      
      <TeamManagement />
    </div>
  );
};

export default MortgageTeam;
