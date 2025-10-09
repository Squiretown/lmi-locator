import React from 'react';
import UnifiedLoginPage from './UnifiedLoginPage';

const LoginPage: React.FC = () => {
  return (
    <UnifiedLoginPage
      mode="professional"
      title="Professional Portal"
      subtitle="Login for Realtors and Mortgage Professionals"
      showSignup={true}
      switchToLink="/client-login"
      switchToText="Are you a client?"
      switchToLinkText="Client Login"
      metaTitle="Professional Login - LMI Locator"
      metaDescription="Professional portal login for real estate professionals"
      icon="users"
      showBackToHome={false}
      showTabIcons={false}
    />
  );
};

export default LoginPage;
