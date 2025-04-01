
// This file re-exports toast functionality but will be empty 
// since we're removing toast notifications

// Provide empty implementations to prevent errors
export const useToast = () => ({
  toast: () => {},
  dismiss: () => {},
  toasts: []
});

export const toast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};
