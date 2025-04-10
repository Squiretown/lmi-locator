
import React from 'react';
import EmailUpdateSection from './sections/EmailUpdateSection';
import PasswordUpdateSection from './sections/PasswordUpdateSection';
import AccountDeletionSection from './sections/AccountDeletionSection';

const SecuritySettings: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Email Update Section */}
      <EmailUpdateSection />
      
      {/* Password Update Section */}
      <PasswordUpdateSection />

      {/* Account Deletion Section */}
      <AccountDeletionSection />
    </div>
  );
};

export default SecuritySettings;
