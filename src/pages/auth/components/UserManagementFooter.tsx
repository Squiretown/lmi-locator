
import React from 'react';
import SignOutAllUsersButton from '@/components/admin/SignOutAllUsersButton';

export const UserManagementFooter: React.FC = () => {
  return (
    <div className="mt-4 flex justify-end">
      <SignOutAllUsersButton />
    </div>
  );
};
