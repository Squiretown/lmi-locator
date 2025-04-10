
import React from 'react';
import DeleteAccountDialog from '@/components/auth/DeleteAccountDialog';

const AccountDeletionSection: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium">Delete Account</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Permanently delete your account and all associated data.
      </p>
      
      <DeleteAccountDialog />
    </div>
  );
};

export default AccountDeletionSection;
