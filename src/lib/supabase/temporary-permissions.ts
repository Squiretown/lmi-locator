
/**
 * Temporary permissions implementation until database is fully configured
 * This bypasses the problematic RLS policies that are causing infinite recursion
 */

const PERMISSION_MAPPINGS = {
  admin: [
    'view_all_users',
    'manage_users', 
    'view_analytics',
    'manage_system_settings',
    'export_data',
    'manage_properties',
    'view_all_searches',
    'manage_marketing_campaigns',
    'view_notifications',
    'manage_notifications',
    'view_user_management',
    'sign_out_all_users',
    'remove_all_users'
  ],
  mortgage_professional: [
    'view_analytics',
    'export_data', 
    'manage_properties',
    'view_own_searches',
    'manage_marketing_campaigns',
    'view_notifications',
    'manage_contacts'
  ],
  realtor: [
    'view_analytics',
    'export_data',
    'manage_properties', 
    'view_own_searches',
    'manage_marketing_campaigns',
    'view_notifications',
    'manage_contacts'
  ],
  client: [
    'view_own_searches',
    'view_notifications'
  ]
};

/**
 * Get permissions for a user type using temporary implementation
 * @param userType The user type (admin, mortgage_professional, realtor, client)
 * @returns Array of permission names
 */
export function getTemporaryPermissions(userType: string): string[] {
  // Default to admin permissions if user_type is admin
  if (userType === 'admin') {
    return PERMISSION_MAPPINGS.admin;
  }
  
  // Return permissions based on user type, defaulting to client permissions
  return PERMISSION_MAPPINGS[userType as keyof typeof PERMISSION_MAPPINGS] || PERMISSION_MAPPINGS.client;
}

/**
 * Check if a user type has a specific permission
 * @param userType The user type
 * @param permission The permission to check
 * @returns Boolean indicating if the user type has the permission
 */
export function checkTemporaryPermission(userType: string, permission: string): boolean {
  const permissions = getTemporaryPermissions(userType);
  return permissions.includes(permission) || userType === 'admin';
}
