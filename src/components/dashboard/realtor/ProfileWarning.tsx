
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';

interface ProfileWarningProps {
  onCreateProfile: () => void;
}

export const ProfileWarning: React.FC<ProfileWarningProps> = ({ onCreateProfile }) => {
  return (
    <Card className="mb-6 bg-amber-50 border-amber-200">
      <CardContent className="py-4">
        <div className="flex items-center text-amber-800">
          <UserCog className="h-5 w-5 mr-2" />
          <p>Please complete your realtor profile to unlock all features.</p>
          <Button variant="outline" size="sm" className="ml-4" onClick={onCreateProfile}>
            Create Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
