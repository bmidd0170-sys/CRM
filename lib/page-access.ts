/**
 * Page Access Control Utilities
 * Handles screen-level access restrictions for admins
 */

export const screenAccessMap: Record<string, string[]> = {
  '/donors': ['No Edit Donors'],
  '/reports': ['No Access Reports'],
  '/events': ['No Manage Events'],
  '/notifications': ['No Manage Notifications'],
  '/admins': ['No Manage Admins'],
  '/settings': ['No Manage Admins'],
  '/ai-policy': ['No Manage Admins']
};

/**
 * Check if a path is restricted
 * @param pathname - The page pathname
 * @param restrictions - Array of restrictions for the admin
 * @param isSuperAdmin - Whether the admin is a super admin
 * @returns true if access is allowed, false if restricted
 */
export function isPathAllowed(pathname: string, restrictions: string[], isSuperAdmin: boolean): boolean {
  // Super admins can access everything
  if (isSuperAdmin) {
    return true;
  }

  // Get the restrictions for this path
  const pathRestrictions = screenAccessMap[pathname] || [];

  // If any restriction applies, deny access
  if (pathRestrictions.some(r => restrictions.includes(r))) {
    return false;
  }

  return true;
}

/**
 * Get redirect URL for restricted access
 * Returns the dashboard as a safe default
 */
export function getRedirectUrl(): string {
  return '/dashboard';
}
