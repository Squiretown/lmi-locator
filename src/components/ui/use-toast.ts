
// Provide empty implementations to prevent errors, but accept arguments
export const useToast = () => ({
  toast: (args?: any) => {},
  dismiss: (toastId?: string) => {},
  toasts: []
});

export const toast = {
  success: (args?: any) => {},
  error: (args?: any) => {},
  info: (args?: any) => {},
  warning: (args?: any) => {},
};
