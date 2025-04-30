
// This file is now just a passthrough to sonner
// to maintain compatibility with existing code
import { toast as sonnerToast } from "sonner";

export const useToast = () => ({
  toast: (args?: any) => sonnerToast(args?.title || "", { description: args?.description }),
  dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  toasts: []
});

export const toast = {
  success: (title: string, description?: string) => sonnerToast.success(title, { description }),
  error: (title: string, description?: string) => sonnerToast.error(title, { description }),
  info: (title: string, description?: string) => sonnerToast.info(title, { description }),
  warning: (title: string, description?: string) => sonnerToast.warning(title, { description }),
};
