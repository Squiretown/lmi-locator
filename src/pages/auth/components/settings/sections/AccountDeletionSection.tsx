
import React from 'react';
import DeleteAccountDialog from '@/components/auth/DeleteAccountDialog';
import CancelAccountDialog from '@/components/auth/CancelAccountDialog';

const AccountDeletionSection: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium">Account Management</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Manage your account status and data.
      </p>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-1">Cancel Account</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Temporarily deactivate your account. You can reactivate it later.
          </p>
          <CancelAccountDialog />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Delete Account</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Permanently delete your account and all associated data.
          </p>
          <DeleteAccountDialog />
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionSection;
