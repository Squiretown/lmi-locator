import React from 'react';
import UnifiedLoginPage from './UnifiedLoginPage';

const ClientLoginPage: React.FC = () => {
  return (
    <UnifiedLoginPage
      mode="client"
      title="Welcome Back"
      subtitle="Access your client dashboard to search properties and view saved listings"
      showSignup={false}
      switchToLink="/login"
      switchToText="Are you a real estate professional?"
      switchToLinkText="Professional Login"
      metaTitle="Client Login - LMI Locator"
      metaDescription="Client portal login for LMI Locator. Access your property search dashboard and saved information."
      icon="userCheck"
      showBackToHome={true}
      showTabIcons={true}
    />
  );
};

export default ClientLoginPage;
