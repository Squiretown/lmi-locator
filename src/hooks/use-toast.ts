
// Standardized toast functionality using Sonner
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title: string;
  description?: string;
  duration?: number;
};

export const useToast = () => ({
  toast: (props: ToastProps) => {
    return sonnerToast(props.title, { 
      description: props.description,
      duration: props.duration
    });
  },
  dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  toasts: []
});

// Simple toast helpers for direct usage
export const toast = {
  default: (title: string, description?: string) => 
    sonnerToast(title, { description }),
  
  success: (title: string, description?: string) => 
    sonnerToast.success(title, { description }),
  
  error: (title: string, description?: string) => 
    sonnerToast.error(title, { description }),
  
  info: (title: string, description?: string) => 
    sonnerToast.info(title, { description }),
  
  warning: (title: string, description?: string) => 
    sonnerToast.warning(title, { description }),
};
