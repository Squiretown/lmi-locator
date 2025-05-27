
import React from 'react';
import { Card } from '@/components/ui/card';
import { NotificationHeader } from './NotificationHeader';
import { AddressSection } from './AddressSection';
import { RoleSpecificContent } from './RoleSpecificContent';
import { ActionButtons } from './ActionButtons';
import { useAuth } from '@/hooks/useAuth';

interface LmiStatusNotificationProps {
  isApproved: boolean;
  address: string;
  tractId: string;
  userType?: string | null;
  onClose: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onContinue?: () => void;
  onSignUp?: () => void;
}

const LmiStatusNotification = ({
  isApproved,
  address,
  tractId,
  userType,
  onClose,
  onShare,
  onSave,
  onContinue,
  onSignUp
}: LmiStatusNotificationProps) => {
  const { user } = useAuth();
  
  // User is logged in if we have a user object
  const isLoggedIn = !!user;
  
  console.log('LmiStatusNotification render:', { 
    isApproved, 
    address, 
    isLoggedIn, 
    userType,
    hasSaveHandler: !!onSave,
    hasSignUpHandler: !!onSignUp,
    userId: user?.id
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-white shadow-xl relative overflow-hidden">
        <NotificationHeader 
          isApproved={isApproved} 
          onClose={onClose} 
        />

        <div className="p-6">
          <AddressSection 
            address={address}
            tractId={tractId}
            isApproved={isApproved}
          />

          <RoleSpecificContent 
            isApproved={isApproved} 
            userType={userType}
          />

          <ActionButtons 
            onShare={onShare}
            onSave={isLoggedIn ? onSave : undefined}
            onSignUp={!isLoggedIn ? onSignUp : undefined}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </Card>
    </div>
  );
};

export default LmiStatusNotification;
