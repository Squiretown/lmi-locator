
import React from 'react';
import { createRoot } from 'react-dom/client';
import BackendSearchNotification from '@/components/notifications/BackendSearchNotification';

export const useBackendNotification = () => {
  const showNotification = (options: {
    address: string;
    tractId: string;
    isApproved: boolean;
    onExport?: () => void;
    onFlag?: () => void;
    onSave?: () => void;
  }) => {
    const { address, tractId, isApproved, onExport, onFlag, onSave } = options;
    
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification-overlay');
    existingNotifications.forEach(notification => {
      document.body.removeChild(notification);
    });
    
    // Create container
    const container = document.createElement('div');
    container.className = 'notification-overlay';
    document.body.appendChild(container);
    
    const root = createRoot(container);
    
    const handleClose = () => {
      root.unmount();
      document.body.removeChild(container);
    };
    
    root.render(
      React.createElement(BackendSearchNotification, {
        isApproved,
        address,
        tractId,
        onClose: handleClose,
        onExport,
        onFlag,
        onSave
      })
    );
    
    return {
      close: handleClose
    };
  };

  return { showNotification };
};
