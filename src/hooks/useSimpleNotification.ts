
import React from 'react';
import { createRoot } from 'react-dom/client';
import LmiStatusNotification from '@/components/notifications/LmiStatusNotification';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const showNotification = async (options: {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  data?: {
    address?: string;
    tractId?: string;
    isApproved?: boolean;
  };
  onClose?: () => void;
}) => {
  const { type, title, message, data, onClose } = options;
  
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification-overlay');
  existingNotifications.forEach(notification => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });
  
  // Create container for the notification
  const container = document.createElement('div');
  container.className = 'notification-overlay';
  document.body.appendChild(container);
  
  const root = createRoot(container);
  
  const handleClose = () => {
    console.log("Closing notification from useSimpleNotification");
    
    // First unmount and remove the component
    root.unmount();
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    
    // Only call the onClose callback after component is unmounted
    setTimeout(() => {
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    }, 0);
  };
  
  // Check if the user is logged in and get user type
  const { data: sessionData } = await supabase.auth.getSession();
  const isLoggedIn = !!sessionData?.session;
  let userType = sessionData?.session?.user?.user_metadata?.user_type || null;
  
  console.log('Notification auth status in useSimpleNotification:', { 
    isLoggedIn, 
    userType,
    sessionExists: !!sessionData?.session
  });
  
  // Handle share button click
  const handleShare = async () => {
    if (!data?.address) return;
    
    const shareText = `Property LMI Status Check Results:
Address: ${data.address}
Status: ${data.isApproved ? 'LMI Eligible' : 'Not in LMI Area'}
Census Tract: ${data.tractId || 'Unknown'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LMI Property Check Results',
          text: shareText
        });
      } catch (err) {
        // Fallback to copy to clipboard if share fails or is cancelled
        await navigator.clipboard.writeText(shareText);
        toast.success("Results copied to clipboard", {
          description: "Property details have been copied to your clipboard"
        });
      }
    } else {
      // Fallback for browsers that don't support sharing
      await navigator.clipboard.writeText(shareText);
      toast.success("Results copied to clipboard", {
        description: "Property details have been copied to your clipboard"
      });
    }
  };

  // Handle save button click for logged in users
  const handleSave = () => {
    console.log('Save property clicked from notification');
    // Show a success toast
    toast.success('Property saved to your collection', {
      description: data?.isApproved 
        ? 'LMI eligible property saved' 
        : 'Property saved for your reference'
    });
    handleClose();
  };

  // Handle signup button for non-logged in users
  const handleSignUp = () => {
    console.log('Sign up clicked');
    // Close the notification
    handleClose();
    // Navigate to login page by changing window location
    window.location.href = '/login';
    // Show toast
    toast.info("Please sign in to save properties", {
      description: 'Create an account to save and track properties'
    });
  };
  
  // Render the notification component
  if (data?.address) {
    root.render(
      React.createElement(LmiStatusNotification, {
        isApproved: data.isApproved || false,
        address: data.address,
        tractId: data.tractId || 'Unknown',
        userType: userType,
        isLoggedIn: isLoggedIn,
        onClose: handleClose,
        onShare: handleShare,
        onSave: isLoggedIn ? handleSave : undefined,
        onSignUp: !isLoggedIn ? handleSignUp : undefined
      })
    );
  }
  
  return {
    close: handleClose
  };
};

export const useSimpleNotification = () => {
  return {
    success: (title: string, message?: string, data?: any, onClose?: () => void) => {
      return showNotification({ type: 'success', title, message, data, onClose });
    },
    error: (title: string, message?: string, data?: any, onClose?: () => void) => {
      return showNotification({ type: 'error', title, message, data, onClose });
    },
    info: (title: string, message?: string, data?: any, onClose?: () => void) => {
      return showNotification({ type: 'info', title, message, data, onClose });
    },
    warning: (title: string, message?: string, data?: any, onClose?: () => void) => {
      return showNotification({ type: 'warning', title, message, data, onClose });
    },
  };
};
