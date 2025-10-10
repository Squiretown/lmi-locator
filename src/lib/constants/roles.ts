/**
 * Central role definition system for the application
 * All role-related constants, types, and utilities should be imported from here
 */

// Canonical role definitions
export const USER_ROLES = {
  ADMIN: 'admin',
  REALTOR: 'realtor', 
  MORTGAGE_PROFESSIONAL: 'mortgage_professional',
  CLIENT: 'client'
} as const;

// User role types (for authentication and permissions)
export const PROFESSIONAL_TYPES = {
  REALTOR: 'realtor',
  MORTGAGE_PROFESSIONAL: 'mortgage_professional'
} as const;

// Database professional types (for invitations and database records)
export const DATABASE_PROFESSIONAL_TYPES = {
  REALTOR: 'realtor',
  MORTGAGE_BROKER: 'mortgage_broker',
  LENDER: 'lender',
  ATTORNEY: 'attorney'
} as const;

// Mapping between user types and database types
export const USER_TYPE_TO_DB_TYPE_MAPPING = {
  'mortgage_professional': 'mortgage_broker',
  'realtor': 'realtor'
} as const;

// Legacy role mappings for backwards compatibility
export const LEGACY_ROLE_MAPPING = {
  'mortgage': 'mortgage_professional',
  'mortgage_broker': 'mortgage_professional',
  'realtor': 'realtor',
  'admin': 'admin',
  'client': 'client'
} as const;

// Display names for UI
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.REALTOR]: 'Realtor',
  [USER_ROLES.MORTGAGE_PROFESSIONAL]: 'Mortgage Professional',
  [USER_ROLES.CLIENT]: 'Client'
} as const;

// Professional role descriptions
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: 'Full system access with administrative privileges',
  [USER_ROLES.REALTOR]: 'Real estate professional with property and client management capabilities',
  [USER_ROLES.MORTGAGE_PROFESSIONAL]: 'Mortgage professional with loan and client management capabilities',
  [USER_ROLES.CLIENT]: 'Client with access to property search and saved listings'
} as const;

// Professional dashboard routes
export const ROLE_DASHBOARD_ROUTES = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.REALTOR]: '/dashboard/realtor',
  [USER_ROLES.MORTGAGE_PROFESSIONAL]: '/dashboard/mortgage',
  [USER_ROLES.CLIENT]: '/dashboard/client'
} as const;

// TypeScript types
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type ProfessionalUserType = typeof PROFESSIONAL_TYPES[keyof typeof PROFESSIONAL_TYPES];
export type DatabaseProfessionalType = typeof DATABASE_PROFESSIONAL_TYPES[keyof typeof DATABASE_PROFESSIONAL_TYPES];
export type LegacyRole = keyof typeof LEGACY_ROLE_MAPPING;

// Legacy type alias for backward compatibility
export type ProfessionalType = ProfessionalUserType;

// Validation functions
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole);
}

export function isValidProfessionalType(type: string): type is ProfessionalType {
  return Object.values(PROFESSIONAL_TYPES).includes(type as ProfessionalType);
}

export function isProfessionalRole(role: string): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === USER_ROLES.REALTOR || normalizedRole === USER_ROLES.MORTGAGE_PROFESSIONAL;
}

// Role normalization utilities
export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return USER_ROLES.CLIENT;
  
  const lowercaseRole = role.toLowerCase();
  
  // Check if it's already a valid role
  if (isValidUserRole(lowercaseRole)) {
    return lowercaseRole;
  }
  
  // Check legacy mappings
  if (lowercaseRole in LEGACY_ROLE_MAPPING) {
    return LEGACY_ROLE_MAPPING[lowercaseRole as LegacyRole];
  }
  
  // Default fallback
  return USER_ROLES.CLIENT;
}

export function normalizeProfessionalType(type: string | null | undefined): ProfessionalType | null {
  if (!type) return null;
  
  const normalizedRole = normalizeRole(type);
  
  if (normalizedRole === USER_ROLES.REALTOR) {
    return PROFESSIONAL_TYPES.REALTOR;
  }
  
  if (normalizedRole === USER_ROLES.MORTGAGE_PROFESSIONAL) {
    return PROFESSIONAL_TYPES.MORTGAGE_PROFESSIONAL;
  }
  
  return null;
}

// Role checking utilities
export function hasRole(userRole: string | null | undefined, requiredRole: UserRole): boolean {
  const normalizedUserRole = normalizeRole(userRole);
  return normalizedUserRole === requiredRole;
}

export function hasAnyRole(userRole: string | null | undefined, requiredRoles: UserRole[]): boolean {
  const normalizedUserRole = normalizeRole(userRole);
  return requiredRoles.includes(normalizedUserRole);
}

export function isAdmin(userRole: string | null | undefined): boolean {
  return hasRole(userRole, USER_ROLES.ADMIN);
}

export function isRealtor(userRole: string | null | undefined): boolean {
  return hasRole(userRole, USER_ROLES.REALTOR);
}

export function isMortgageProfessional(userRole: string | null | undefined): boolean {
  return hasRole(userRole, USER_ROLES.MORTGAGE_PROFESSIONAL);
}

export function isClient(userRole: string | null | undefined): boolean {
  return hasRole(userRole, USER_ROLES.CLIENT);
}

// Display utilities
export function getRoleDisplayName(role: string | null | undefined): string {
  const normalizedRole = normalizeRole(role);
  return ROLE_DISPLAY_NAMES[normalizedRole] || 'Unknown';
}

export function getRoleDescription(role: string | null | undefined): string {
  const normalizedRole = normalizeRole(role);
  return ROLE_DESCRIPTIONS[normalizedRole] || 'Unknown role';
}

export function getDashboardRoute(role: string | null | undefined): string {
  const normalizedRole = normalizeRole(role);
  return ROLE_DASHBOARD_ROUTES[normalizedRole] || '/';
}

/**
 * Converts user role type to database professional_type
 * Used when creating invitations or database records
 */
export function convertUserTypeToDatabaseType(
  userType: 'realtor' | 'mortgage_professional'
): DatabaseProfessionalType {
  return USER_TYPE_TO_DB_TYPE_MAPPING[userType] || 'mortgage_broker';
}

/**
 * Converts database professional_type to user role type
 * Used when reading from database
 */
export function convertDatabaseTypeToUserType(
  dbType: string
): ProfessionalUserType {
  if (dbType === 'mortgage_broker' || dbType === 'lender') {
    return 'mortgage_professional';
  }
  return 'realtor';
}

// Export arrays for select options
export const ALL_USER_ROLES = Object.values(USER_ROLES);
export const PROFESSIONAL_ROLES = [USER_ROLES.REALTOR, USER_ROLES.MORTGAGE_PROFESSIONAL];
export const NON_ADMIN_ROLES = [USER_ROLES.REALTOR, USER_ROLES.MORTGAGE_PROFESSIONAL, USER_ROLES.CLIENT];