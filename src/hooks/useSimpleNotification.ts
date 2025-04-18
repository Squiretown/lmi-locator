
import React from 'react';
import { createRoot } from 'react-dom/client';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';

export const showNotification = (options: {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  data?: {
    address?: string;
    tractId?: string;
    isApproved?: boolean;
  };
  duration?: number;
}) => {
  const { duration = 5000, data } = options;
  
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification-overlay');
  existingNotifications.forEach(notification => {
    document.body.removeChild(notification);
  });
  
  // Create container for the notification
  const container = document.createElement('div');
  container.className = 'notification-overlay';
  document.body.appendChild(container);
  
  const root = createRoot(container);
  
  const handleClose = () => {
    root.unmount();
    document.body.removeChild(container);
  };
  
  // Render the notification component
  if (data?.address) {
    // Using createElement instead of JSX to avoid TypeScript errors in .ts file
    root.render(
      React.createElement(LmiStatusNotification, {
        isApproved: data.isApproved || false,
        address: data.address,
        tractId: data.tractId || 'Unknown',
        onClose: handleClose,
        onShare: () => console.log('Share clicked'),
        onSave: () => console.log('Save clicked'),
        onContinue: () => console.log('Continue clicked')
      })
    );
  }
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(handleClose, duration);
  }
  
  return {
    close: handleClose
  };
};

export const useSimpleNotification = () => {
  return {
    success: (title: string, message?: string, data?: any) => 
      showNotification({ type: 'success', title, message, data }),
    error: (title: string, message?: string, data?: any) => 
      showNotification({ type: 'error', title, message, data }),
    info: (title: string, message?: string, data?: any) => 
      showNotification({ type: 'info', title, message, data }),
    warning: (title: string, message?: string, data?: any) => 
      showNotification({ type: 'warning', title, message, data }),
  };
};
