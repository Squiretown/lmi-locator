
/**
 * A simple notification system that doesn't rely on React components
 * Used as a fallback when the toast system might not be available
 */
export const showNotification = (options: {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}) => {
  const { type, title, message, duration = 5000 } = options;
  
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification-overlay');
  existingNotifications.forEach(notification => {
    document.body.removeChild(notification);
  });
  
  // Create the notification overlay
  const overlay = document.createElement('div');
  overlay.className = 'notification-overlay fixed inset-0 flex items-center justify-center z-50';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  
  // Create the notification element
  const notification = document.createElement('div');
  
  // Set styles based on type
  let bgColor = 'bg-blue-500';
  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      break;
  }
  
  // Add styling
  notification.className = `${bgColor} text-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4 relative`;
  
  // Create title element
  const titleElement = document.createElement('div');
  titleElement.className = 'font-bold text-xl mb-3';
  titleElement.textContent = title;
  notification.appendChild(titleElement);
  
  // Add message if provided
  if (message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'text-base whitespace-pre-line';
    messageElement.textContent = message;
    notification.appendChild(messageElement);
  }
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'absolute top-3 right-3 text-white hover:text-gray-200 text-xl font-bold';
  closeButton.innerHTML = '✕';
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };
  notification.appendChild(closeButton);
  
  // Add notification to overlay
  overlay.appendChild(notification);
  
  // Add to DOM
  document.body.appendChild(overlay);
  
  // Remove after specified duration
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  }, duration);
  
  return {
    close: () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
  };
};

export const useSimpleNotification = () => {
  return {
    success: (title: string, message?: string) => 
      showNotification({ type: 'success', title, message }),
    error: (title: string, message?: string) => 
      showNotification({ type: 'error', title, message }),
    info: (title: string, message?: string) => 
      showNotification({ type: 'info', title, message }),
    warning: (title: string, message?: string) => 
      showNotification({ type: 'warning', title, message }),
  };
};

