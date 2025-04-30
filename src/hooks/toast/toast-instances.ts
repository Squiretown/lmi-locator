
import { toast as sonnerToast } from "sonner";

// Create a helper function to get a toast instance
const getToastInstance = () => {
  // Return the sonner toast directly
  return sonnerToast;
};

// Pre-configured toast variants
export const toastApi = {
  success: (opts: { title: string; description?: string }) => {
    return sonnerToast.success(opts.title, {
      description: opts.description
    });
  },
  error: (opts: { title: string; description?: string }) => {
    return sonnerToast.error(opts.title, {
      description: opts.description
    });
  },
  info: (opts: { title: string; description?: string }) => {
    return sonnerToast.info(opts.title, {
      description: opts.description
    });
  },
  warning: (opts: { title: string; description?: string }) => {
    return sonnerToast.warning(opts.title, {
      description: opts.description
    });
  },
};
