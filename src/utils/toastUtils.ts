
import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showToast = (
  type: ToastType,
  message: string,
  options?: ToastOptions
) => {
  const { description, duration, action } = options || {};
  
  switch (type) {
    case 'success':
      toast.success(message, { description, duration, action });
      break;
    case 'error':
      toast.error(message, { description, duration, action });
      break;
    case 'info':
      toast.info(message, { description, duration, action });
      break;
    case 'warning':
      toast.warning(message, { description, duration, action });
      break;
    default:
      toast(message, { description, duration, action });
  }
};

export const showSearchStarted = (count: number) => {
  showToast('info', 'Search started', {
    description: `Processing ${count} addresses...`,
    duration: 3000
  });
};

export const showSearchComplete = (total: number, eligible: number) => {
  showToast('success', 'Search completed', {
    description: `Found ${eligible} eligible properties out of ${total} addresses`,
    duration: 5000
  });
};

export const showSearchError = (error: string) => {
  showToast('error', 'Search failed', {
    description: error || 'An error occurred during the search process',
    duration: 5000
  });
};

export const showExportSuccess = (filename: string) => {
  showToast('success', 'Export successful', {
    description: `Data exported to ${filename}`,
    duration: 3000
  });
};

export const showExportError = (error: string) => {
  showToast('error', 'Export failed', {
    description: error || 'Unable to export the data',
    duration: 5000
  });
};
