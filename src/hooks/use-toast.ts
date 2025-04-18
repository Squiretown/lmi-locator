
import * as React from "react"
import { reducer, toastTimeouts } from "./toast/reducer"
import { actionTypes, genId } from "./toast/actions"
import { ToasterToast, ToastOptions, TOAST_REMOVE_DELAY } from "./toast/types"

// Create a React context for the toast
const ToastContext = React.createContext<{
  toast: (props: Omit<ToasterToast, "id">) => string;
  update: (props: ToasterToast) => void;
  dismiss: (toastId?: string) => void;
  toasts: ToasterToast[];
}>({
  toast: () => "",
  update: () => {},
  dismiss: () => {},
  toasts: [],
});

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    const [state, dispatch] = React.useReducer(reducer, {
      toasts: [],
    });

    React.useEffect(() => {
      state.toasts.forEach((toast) => {
        if (toast.open) return;

        const timeoutId = setTimeout(() => {
          dispatch({
            type: "REMOVE_TOAST",
            toastId: toast.id,
          });
        }, TOAST_REMOVE_DELAY);

        toastTimeouts.set(toast.id, timeoutId);
      });
    }, [state.toasts]);

    const toast = React.useCallback(({ ...props }: Omit<ToasterToast, "id">) => {
      const id = genId();

      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...props,
          id,
          open: true,
        },
      });

      return id;
    }, []);

    const update = React.useCallback(
      (props: ToasterToast) => {
        dispatch({
          type: "UPDATE_TOAST",
          toast: props,
        });
      },
      []
    );

    const dismiss = React.useCallback((toastId?: string) => {
      dispatch({
        type: "DISMISS_TOAST",
        toastId,
      });
    }, []);

    return {
      toasts: state.toasts,
      toast,
      dismiss,
      update,
    };
  }
  
  return context;
}

// Create a global toast helper that doesn't rely on require
export const toast = {
  success: (opts: ToastOptions) => {
    // Use a function that can be safely called in a browser environment
    const ui = document.getElementById('toast-container');
    if (!ui) {
      console.warn('Toast container not found; toast may not be visible');
    }
    
    // Create a temporary element to show the toast
    const toastElement = document.createElement('div');
    toastElement.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded shadow-lg';
    toastElement.textContent = opts.title ? opts.title.toString() : '';
    
    if (opts.description) {
      const description = document.createElement('div');
      description.className = 'text-sm mt-1';
      description.textContent = opts.description.toString();
      toastElement.appendChild(description);
    }
    
    document.body.appendChild(toastElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
      toastElement.remove();
    }, 5000);
    
    return '1'; // Return dummy ID
  },
  
  error: (opts: ToastOptions) => {
    // Similar implementation for error toast
    const toastElement = document.createElement('div');
    toastElement.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded shadow-lg';
    toastElement.textContent = opts.title ? opts.title.toString() : '';
    
    if (opts.description) {
      const description = document.createElement('div');
      description.className = 'text-sm mt-1';
      description.textContent = opts.description.toString();
      toastElement.appendChild(description);
    }
    
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.remove();
    }, 5000);
    
    return '1';
  },
  
  info: (opts: ToastOptions) => {
    // Info toast implementation
    const toastElement = document.createElement('div');
    toastElement.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white p-4 rounded shadow-lg';
    toastElement.textContent = opts.title ? opts.title.toString() : '';
    
    if (opts.description) {
      const description = document.createElement('div');
      description.className = 'text-sm mt-1';
      description.textContent = opts.description.toString();
      toastElement.appendChild(description);
    }
    
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.remove();
    }, 5000);
    
    return '1';
  },
  
  warning: (opts: ToastOptions) => {
    // Warning toast implementation
    const toastElement = document.createElement('div');
    toastElement.className = 'fixed top-4 right-4 z-50 bg-yellow-500 text-white p-4 rounded shadow-lg';
    toastElement.textContent = opts.title ? opts.title.toString() : '';
    
    if (opts.description) {
      const description = document.createElement('div');
      description.className = 'text-sm mt-1';
      description.textContent = opts.description.toString();
      toastElement.appendChild(description);
    }
    
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.remove();
    }, 5000);
    
    return '1';
  },
};
