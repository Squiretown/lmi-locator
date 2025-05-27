
import React from 'react';
import CancelAccountDialog from '@/components/auth/CancelAccountDialog';

const AccountDeletionSection: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium">Account Management</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Manage your account status.
      </p>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-1">Request Account Cancellation</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Submit a request to cancel your account. An administrator will review and process your request.
          </p>
          <CancelAccountDialog />
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionSection;
