
import { toast as sonnerToast } from "sonner";
import type { ToastProps } from "@/hooks/use-toast";

// Create a helper function to get a toast instance
const getToastInstance = () => {
  // Return the sonner toast directly
  return sonnerToast;
};

// Pre-configured toast variants
export const toastApi = {
  success: (opts: { title: string; description?: string; duration?: number }) => {
    return sonnerToast.success(opts.title, {
      description: opts.description,
      duration: opts.duration
    });
  },
  error: (opts: { title: string; description?: string; duration?: number }) => {
    return sonnerToast.error(opts.title, {
      description: opts.description,
      duration: opts.duration
    });
  },
  info: (opts: { title: string; description?: string; duration?: number }) => {
    return sonnerToast.info(opts.title, {
      description: opts.description,
      duration: opts.duration
    });
  },
  warning: (opts: { title: string; description?: string; duration?: number }) => {
    return sonnerToast.warning(opts.title, {
      description: opts.description,
      duration: opts.duration
    });
  },
};
