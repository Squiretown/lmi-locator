
// This file is now just a passthrough to sonner
// to maintain compatibility with existing code
import { toast as sonnerToast } from "sonner";
import { ToastProps } from "@/hooks/use-toast";

export const useToast = () => ({
  toast: (props?: ToastProps) => {
    if (!props) return;
    
    if (props.variant === "destructive") {
      return sonnerToast.error(props.title, { 
        description: props.description,
        duration: props.duration
      });
    }
    return sonnerToast(props.title, { 
      description: props.description,
      duration: props.duration
    });
  },
  dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  toasts: []
});

// Create simple toast helpers for backward compatibility
export const toast = {
  default: (title: string, description?: string) => sonnerToast(title, { description }),
  success: (title: string, description?: string) => sonnerToast.success(title, { description }),
  error: (title: string, description?: string) => sonnerToast.error(title, { description }),
  info: (title: string, description?: string) => sonnerToast.info(title, { description }),
  warning: (title: string, description?: string) => sonnerToast.warning(title, { description }),
};
