
import React from 'react';
import { Card } from '@/components/ui/card';
import { NotificationHeader } from './NotificationHeader';
import { AddressSection } from './AddressSection';
import { RoleSpecificContent } from './RoleSpecificContent';
import { ActionButtons } from './ActionButtons';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LmiStatusNotificationProps {
  isApproved: boolean;
  address: string;
  tractId: string;
  userType?: string | null;
  onClose: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onContinue?: () => void;
}

const LmiStatusNotification = ({
  isApproved,
  address,
  tractId,
  userType,
  onClose,
  onShare,
  onSave,
  onContinue
}: LmiStatusNotificationProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    onClose();
    navigate('/login');
  };

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
            onSave={user ? onSave : undefined}
            onSignUp={!user ? handleSignUp : undefined}
          />
        </div>
      </Card>
    </div>
  );
};

export default LmiStatusNotification;
