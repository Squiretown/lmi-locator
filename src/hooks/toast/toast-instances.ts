
import { ToastOptions } from "./types";
import { useToast as useToastHook } from "../use-toast";

// Create a helper function to get a toast instance
const getToastInstance = () => {
  // We need to use a custom implementation that avoids using require
  // and is safe for the browser
  const toastHook = useToastHook();
  return toastHook.toast;
};

// Pre-configured toast variants
export const toastApi = {
  success: (opts: ToastOptions) => {
    return getToastInstance()({
      ...opts,
      variant: 'default',
      className: 'bg-green-500 text-white border-green-600',
    });
  },
  error: (opts: ToastOptions) => {
    return getToastInstance()({
      ...opts,
      variant: 'destructive',
    });
  },
  info: (opts: ToastOptions) => {
    return getToastInstance()({
      ...opts,
      variant: 'default',
      className: 'bg-blue-500 text-white border-blue-600',
    });
  },
  warning: (opts: ToastOptions) => {
    return getToastInstance()({
      ...opts,
      variant: 'default',
      className: 'bg-yellow-500 text-white border-yellow-600',
    });
  },
};
