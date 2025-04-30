
// Forward all toast functionality to sonner
import { toast as sonnerToast } from "sonner";
import { ToastOptions } from "./toast/types";

export const useToast = () => ({
  toast: (props: { title: string; description?: string }) => sonnerToast(props.title, { description: props.description }),
  update: (props: { id: string; title: string; description?: string }) => sonnerToast.update(props.id, { description: props.description }),
  dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  toasts: []
});

// Create simple toast helpers
export const toast = {
  success: (title: string, options?: { description?: string }) => 
    sonnerToast.success(title, options),
  
  error: (title: string, options?: { description?: string }) => 
    sonnerToast.error(title, options),
  
  info: (title: string, options?: { description?: string }) => 
    sonnerToast.info(title, options),
  
  warning: (title: string, options?: { description?: string }) => 
    sonnerToast.warning(title, options),
};
