
import React from 'react';
import { Card } from '@/components/ui/card';
import { NotificationHeader } from './NotificationHeader';
import { AddressSection } from './AddressSection';
import { RoleSpecificContent } from './RoleSpecificContent';
import { ActionButtons } from './ActionButtons';
import ResultsMap from '../map/ResultsMap';

interface LmiStatusNotificationProps {
  isApproved: boolean;
  address: string;
  tractId: string;
  userType?: string | null;
  isLoggedIn: boolean;
  dataSource?: any; // LMI result data for transparency
  lat?: number;
  lon?: number;
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
  isLoggedIn,
  dataSource,
  lat,
  lon,
  onClose,
  onShare,
  onSave,
  onContinue,
  onSignUp
}: LmiStatusNotificationProps) => {
  console.log('LmiStatusNotification render:', { 
    isApproved, 
    address, 
    isLoggedIn, 
    userType,
    hasSaveHandler: !!onSave,
    hasSignUpHandler: !!onSignUp
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full bg-white shadow-xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <NotificationHeader 
          isApproved={isApproved} 
          onClose={onClose} 
        />

        <div className="p-6 space-y-6">
          <AddressSection 
            address={address}
            tractId={tractId}
            isApproved={isApproved}
            dataSource={dataSource}
          />

          {/* Map Section */}
          {tractId && lat && lon && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b">
                <h3 className="font-medium text-sm">Census Tract Map</h3>
              </div>
              <div className="h-[300px]">
                <ResultsMap 
                  tractId={tractId} 
                  address={address}
                  lat={lat}
                  lon={lon}
                />
              </div>
            </div>
          )}

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
