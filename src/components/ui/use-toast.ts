
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

