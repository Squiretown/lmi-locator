
// Forward all toast functionality to sonner
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

// Create simple toast helpers
export const toast = {
  // Basic toast function
  default: (title: string, description?: string) => 
    sonnerToast(title, { description }),
  
  // Toast variants
  success: (title: string, description?: string) => 
    sonnerToast.success(title, { description }),
  
  error: (title: string, description?: string) => 
    sonnerToast.error(title, { description }),
  
  info: (title: string, description?: string) => 
    sonnerToast.info(title, { description }),
  
  warning: (title: string, description?: string) => 
    sonnerToast.warning(title, { description }),
};
