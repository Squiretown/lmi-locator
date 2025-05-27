
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';
import ProfileMenu from '@/components/auth/ProfileMenu';

interface RealtorHeaderProps {
  onEditProfile: () => void;
  onSignOut: () => void;
  showCreateProfile: boolean;
}

export const RealtorHeader: React.FC<RealtorHeaderProps> = ({
  onEditProfile,
  onSignOut,
  showCreateProfile
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Real Estate Agent Dashboard</h1>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onEditProfile}>
          <UserCog className="mr-2 h-4 w-4" />
          {showCreateProfile ? 'Create Profile' : 'Edit Profile'}
        </Button>
        <ProfileMenu />
      </div>
    </div>
  );
};
