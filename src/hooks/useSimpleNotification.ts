
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
  notification.className = `fixed top-4 right-4 z-50 ${bgColor} text-white p-4 rounded shadow-lg max-w-sm`;
  
  // Create title element
  const titleElement = document.createElement('div');
  titleElement.className = 'font-bold';
  titleElement.textContent = title;
  notification.appendChild(titleElement);
  
  // Add message if provided
  if (message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'text-sm mt-1';
    messageElement.textContent = message;
    notification.appendChild(messageElement);
  }
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'absolute top-2 right-2 text-white hover:text-gray-200';
  closeButton.innerHTML = '✕';
  closeButton.onclick = () => {
    document.body.removeChild(notification);
  };
  notification.appendChild(closeButton);
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after specified duration
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, duration);
  
  return {
    close: () => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
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
