
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
    onReset?: () => void;
  }) => {
    const { address, tractId, isApproved, onExport, onFlag, onSave, onReset } = options;
    
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification-overlay');
    existingNotifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
    
    // Create container
    const container = document.createElement('div');
    container.className = 'notification-overlay';
    document.body.appendChild(container);
    
    const root = createRoot(container);
    
    const handleClose = () => {
      console.log("Closing notification in useBackendNotification");
      root.unmount();
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      
      // Always call the onReset function when closing if provided
      if (onReset && typeof onReset === 'function') {
        console.log("Executing onReset callback when closing notification");
        onReset();
      }
    };
    
    root.render(
      React.createElement(BackendSearchNotification, {
        isApproved,
        address,
        tractId,
        onClose: handleClose,
        onExport,
        onFlag,
        onSave,
        isBackendNotification: true
      })
    );
    
    return {
      close: handleClose
    };
  };

  return { showNotification };
};
