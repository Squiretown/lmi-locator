
// Temporary implementation of permissions until fully implemented in the database
// This file will be removed once the actual permissions are implemented

// Standard permission strings
export const PERMISSIONS = {
  MANAGE_SYSTEM: 'manage_system',
  MANAGE_USERS: 'manage_users',
  MANAGE_PROPERTIES: 'manage_properties',
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_REALTORS: 'manage_realtors',
  RUN_MARKETING: 'run_marketing',
  VIEW_REPORTS: 'view_reports',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_DASHBOARD: 'view_dashboard',
};

// Temporary implementation - normally would come from database
export const getTemporaryPermissions = (userType: string | null): string[] => {
  if (!userType) return [];
  
  // Admin has all permissions
  if (userType === 'admin') {
    return Object.values(PERMISSIONS);
  }
  
  // Assign permissions based on user type
  switch (userType) {
    case 'mortgage_professional':
      return [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_CLIENTS,
        PERMISSIONS.RUN_MARKETING,
        PERMISSIONS.VIEW_REPORTS
      ];
    case 'realtor':
      return [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_CLIENTS,
        PERMISSIONS.MANAGE_PROPERTIES,
        PERMISSIONS.VIEW_REPORTS
      ];
    case 'client':
      return [
        PERMISSIONS.VIEW_DASHBOARD
      ];
    default:
      return [];
  }
};
